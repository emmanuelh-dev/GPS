import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Snackbar } from '@mui/material';
import { devicesActions, sessionActions, alarmsActions } from './store';
import { useEffectAsync } from './reactHelper';
import { useTranslation } from './common/components/LocalizationProvider';
import { snackBarDurationLongMs } from './common/util/duration';
import alarm from './resources/alarm.mp3';
import danger from './resources/danger.mp3';
import { eventsActions } from './store/events';
import useFeatures from './common/util/useFeatures';
import { useAttributePreference } from './common/util/preferences';

const alertKeyframes = `
  @keyframes alertFlash {
    0% { background-color: rgba(255, 0, 0, 0.2); }
    50% { background-color: rgba(255, 255, 0, 0.2); }
    100% { background-color: rgba(255, 0, 0, 0.2); }
  }

  @keyframes buttonPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

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
  flexDirection: 'column',
  pointerEvents: 'auto',
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
  marginBottom: '20px',
};

const alertButtonStyles = {
  padding: '10px 20px',
  backgroundColor: '#ff3333',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  animation: 'buttonPulse 1s infinite',
  ':hover': {
    backgroundColor: '#cc0000',
  }
};

const timeStyles = {
  marginTop: '10px',
  fontSize: '14px',
  color: '#ffffff',
};

const logoutCode = 4000;

const SocketController = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const authenticated = useSelector((state) => !!state.session.user);
  const devices = useSelector((state) => state.devices.items);
  const includeLogs = useSelector((state) => state.session.includeLogs);
  
  // Selectores del store de alarmas
  const isAlarmActive = useSelector((state) => state.alarms.isActive);
  const activeEvents = useSelector((state) => state.alarms.activeEvents);
  const currentAlarmMessage = useSelector((state) => state.alarms.currentMessage);
  const alarmStartTime = useSelector((state) => state.alarms.startTime);
  const notifications = useSelector((state) => state.alarms.notifications);

  const socketRef = useRef();
  const [events, setEvents] = useState([]);
  const audioRef = useRef(null);
  const [alarmTime, setAlarmTime] = useState(0);
  const animationFrameRef = useRef(null);

  const soundEvents = useAttributePreference('soundEvents', '');
  const soundAlarms = useAttributePreference('soundAlarms', 'sos');

  const features = useFeatures();

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = alertKeyframes;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const updateTime = () => {
    if (alarmStartTime) {
      const elapsedTime = Math.floor((Date.now() - alarmStartTime) / 1000);
      setAlarmTime(elapsedTime);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  };

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
    if (isAlarmActive && alarmStartTime) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (!isAlarmActive) {
        setAlarmTime(0);
      }
    };
  }, [isAlarmActive, alarmStartTime]);

  useEffect(() => {
    if (events.length > 0) {
      // Agregar cada evento al store de alarmas
      events.forEach(event => {
        dispatch(alarmsActions.addEvent(event));
      });
    }
  }, [events, dispatch]);

  // Efecto separado para manejar el audio cuando se activa la alarma
  useEffect(() => {
    if (isAlarmActive && !audioRef.current) {
      const audio = new Audio(danger);
      audio.loop = true;
      audioRef.current = audio;
      audio.play().catch(error => console.log('Error playing audio:', error));

      if ('vibrate' in navigator) {
        navigator.vibrate([1000, 500, 1000]);
      }
    } else if (!isAlarmActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      
      if ('vibrate' in navigator) {
        navigator.vibrate(0);
      }
    }
  }, [isAlarmActive]);

  // Cleanup effect cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if ('vibrate' in navigator) {
        navigator.vibrate(0);
      }
    };
  }, []);

  const handleDismissAlert = () => {
    dispatch(alarmsActions.dismissAlarm());
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setAlarmTime(0);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
    
    setEvents([]);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {isAlarmActive && (
        <div style={alertOverlayStyles}>
          <div style={alertMessageStyles}>
            {currentAlarmMessage}
            <div style={timeStyles}>
              Tiempo activa: {formatTime(alarmTime)}
            </div>
          </div>
          <button 
            style={alertButtonStyles}
            onClick={handleDismissAlert}
          >
            Desactivar Alarma
          </button>
        </div>
      )}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={notification.show}
          message={notification.message}
          autoHideDuration={snackBarDurationLongMs}
          onClose={() => {
            dispatch(alarmsActions.removeNotification(notification.id));
          }}
        />
      ))}
    </>
  );
};

export default connect()(SocketController);
