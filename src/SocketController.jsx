import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Snackbar } from '@mui/material';
import { devicesActions, sessionActions } from './store';
import { useEffectAsync } from './reactHelper';
import { useTranslation } from './common/components/LocalizationProvider';
import { snackBarDurationLongMs } from './common/util/duration';
import alarm from './resources/alarm.mp3';
import danger from './resources/danger.mp3';
import { eventsActions } from './store/events';
import useFeatures from './common/util/useFeatures';
import { useAttributePreference } from './common/util/preferences';

// Estilos para la capa de alerta
const alertOverlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto',
  cursor: 'pointer',
  animation: 'alertFlash 2s infinite',
};

const alertMessageStyles = {
  padding: '20px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  borderRadius: '8px',
  fontSize: '18px',
  textAlign: 'center',
  maxWidth: '80%',
};

// Definir los keyframes para la animación
const alertKeyframes = `
  @keyframes alertFlash {
    0% { background-color: rgba(255, 0, 0, 0.2); }
    50% { background-color: rgba(255, 255, 0, 0.2); }
    100% { background-color: rgba(255, 0, 0, 0.2); }
  }
`;

const logoutCode = 4000;

const SocketController = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const authenticated = useSelector((state) => !!state.session.user);
  const devices = useSelector((state) => state.devices.items);
  const includeLogs = useSelector((state) => state.session.includeLogs);

  const socketRef = useRef();

  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAlertOverlay, setShowAlertOverlay] = useState(false);
  const [currentAlertMessage, setCurrentAlertMessage] = useState('');

  const soundEvents = useAttributePreference('soundEvents', '');
  const soundAlarms = useAttributePreference('soundAlarms', 'sos');

  const features = useFeatures();

  // Agregar los keyframes al documento
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = alertKeyframes;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const connectSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/api/socket`);
    socketRef.current = socket;

    socket.onopen = () => {
      dispatch(sessionActions.updateSocket(true));
    };

    socket.onclose = async (event) => {
      dispatch(sessionActions.updateSocket(false));
      if (event.code !== logoutCode) {
        try {
          const devicesResponse = await fetch('/api/devices');
          if (devicesResponse.ok) {
            dispatch(devicesActions.update(await devicesResponse.json()));
          }
          const positionsResponse = await fetch('/api/positions');
          if (positionsResponse.ok) {
            dispatch(sessionActions.updatePositions(await positionsResponse.json()));
          }
          if (devicesResponse.status === 401 || positionsResponse.status === 401) {
            navigate('/login');
          }
        } catch (error) {
          // ignore errors
        }
        setTimeout(() => connectSocket(), 60000);
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.devices) {
        dispatch(devicesActions.update(data.devices));
      }
      if (data.positions) {
        dispatch(sessionActions.updatePositions(data.positions));
      }
      if (data.events) {
        if (!features.disableEvents) {
          dispatch(eventsActions.add(data.events));
        }
        setEvents(data.events);
      }
      if (data.logs) {
        dispatch(sessionActions.updateLogs(data.logs));
      }
    };
  };

  useEffect(() => {
    socketRef.current?.send(JSON.stringify({ logs: includeLogs }));
  }, [socketRef, includeLogs]);

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetch('/api/devices');
      if (response.ok) {
        dispatch(devicesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
      connectSocket();
      return () => {
        const socket = socketRef.current;
        if (socket) {
          socket.close(logoutCode);
        }
      };
    }
    return null;
  }, [authenticated]);

  useEffect(() => {
    if (events.length > 0) {
      setShowAlertOverlay(true);
      setCurrentAlertMessage(events[0].attributes.message || 'Alert!');
    }
  }, [events]);

  useEffect(() => {
    setNotifications(
      events.map((event) => ({
        id: event.id,
        message: event.attributes.message,
        show: true,
      }))
    );
  }, [events, devices, t]);

  useEffect(() => {
    events.forEach((event) => {
      if (
        soundEvents.includes(event.type) ||
        (event.type === 'alarm' && soundAlarms.includes(event.attributes.alarm))
      ) {
        new Audio(danger).play();
      }
    });
  }, [events, soundEvents, soundAlarms]);

  const handleDismissAlert = () => {
    setShowAlertOverlay(false);
    setCurrentAlertMessage('');
    setEvents([]);
  };

  return (
    <>
      {showAlertOverlay && (
        <div style={alertOverlayStyles} onClick={handleDismissAlert}>
          <div style={alertMessageStyles}>
            {currentAlertMessage}
          </div>
        </div>
      )}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={notification.show}
          message={notification.message}
          autoHideDuration={snackBarDurationLongMs}
          onClose={() => {
            setEvents(events.filter((e) => e.id !== notification.id));
            if (events.length === 1) {
              setShowAlertOverlay(false);
              setCurrentAlertMessage('');
            }
          }}
        />
      ))}
    </>
  );
};

export default connect()(SocketController);
