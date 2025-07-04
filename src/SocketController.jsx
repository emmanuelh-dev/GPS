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
  const audioStoppedRef = useRef(false);
  const audioListenersRef = useRef([]);
  const audioIntervalRef = useRef(null);

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

  // Efecto para manejar notificaciones del navegador cuando llegan nuevas alarmas
  useEffect(() => {
    if (activeEvents.length > 0) {
      // Solo crear notificación del navegador para el primer evento o nuevos eventos
      const latestEvent = activeEvents[activeEvents.length - 1];
      
      // Solicitar permisos para notificaciones si no los tenemos
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Crear notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        const totalAlarms = activeEvents.length;
        const title = totalAlarms === 1 ? '🚨 ALARMA ACTIVA' : `🚨 ${totalAlarms} ALARMAS ACTIVAS`;
        const body = totalAlarms === 1 
          ? (latestEvent.attributes.message || 'Alarma activada en el sistema')
          : `Nueva alarma: ${latestEvent.attributes.message || 'Alarma adicional'}`;
          
        const notification = new Notification(title, {
          body: body,
          icon: '/favicon.ico',
          tag: 'alarm-' + latestEvent.id, // Tag único por evento
          requireInteraction: true,
          silent: false
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    }
  }, [activeEvents]); // Depende de activeEvents para detectar nuevas alarmas

  // Efecto para manejar notificaciones del navegador como respaldo
  useEffect(() => {
    if (isAlarmActive) {
      // Solicitar permisos para notificaciones si no los tenemos
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Crear notificación del navegador como respaldo
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('🚨 ALARMA ACTIVA', {
          body: currentAlarmMessage || 'Alarma activada en el sistema',
          icon: '/favicon.ico',
          tag: 'alarm',
          requireInteraction: true, // La notificación no se cierra automáticamente
          silent: false
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    }
  }, [isAlarmActive, currentAlarmMessage]);

  // Efecto separado para manejar el audio cuando se activa la alarma
  useEffect(() => {
    if (isAlarmActive && !audioRef.current) {
      console.log('Activando audio de alarma...');
      audioStoppedRef.current = false; // Resetear flag al activar nueva alarma
      
      const audio = new Audio(danger);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 1.0;
      audioRef.current = audio;
      
      // Asegurar que el audio siempre se reproduzca
      const playAudio = () => {
        // Solo reproducir si la alarma sigue activa y no ha sido detenida
        if (isAlarmActive && !audioStoppedRef.current) {
          audio.muted = false;
          audio.play().catch(error => {
            console.log('Error playing audio:', error);
            // Reintentar después de un breve retraso solo si sigue activa
            if (isAlarmActive && !audioStoppedRef.current) {
              setTimeout(playAudio, 1000);
            }
          });
        }
      };
      
      playAudio();

      // Manejar eventos del audio para mantenerlo reproduciendo
      const handleEnded = () => {
        if (isAlarmActive && !audioStoppedRef.current) {
          playAudio();
        }
      };

      const handlePause = () => {
        if (isAlarmActive && !audioStoppedRef.current) {
          console.log('Audio pausado inesperadamente, reiniciando...');
          setTimeout(playAudio, 100);
        }
      };

      const handleCanPlay = () => {
        if (isAlarmActive && !audioStoppedRef.current && audio.paused) {
          playAudio();
        }
      };

      const handleSuspend = () => {
        if (isAlarmActive && !audioStoppedRef.current) {
          console.log('Audio suspendido, reactivando...');
          setTimeout(playAudio, 100);
        }
      };

      // Almacenar referencias para poder limpiarlas después
      audioListenersRef.current = [
        { event: 'ended', handler: handleEnded },
        { event: 'pause', handler: handlePause },
        { event: 'canplay', handler: handleCanPlay },
        { event: 'suspend', handler: handleSuspend }
      ];

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('suspend', handleSuspend);

      if ('vibrate' in navigator) {
        navigator.vibrate([1000, 500, 1000]);
      }

      // Cleanup function para remover listeners
      return () => {
        if (audioListenersRef.current && audioRef.current) {
          audioListenersRef.current.forEach(({ event, handler }) => {
            audioRef.current.removeEventListener(event, handler);
          });
        }
        audioListenersRef.current = [];
      };
    } else if (!isAlarmActive && audioRef.current) {
      // Solo pausar cuando la alarma se desactiva completamente
      console.log('Desactivando audio completamente...');
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      
      if ('vibrate' in navigator) {
        navigator.vibrate(0);
      }
    }
    // IMPORTANTE: No incluir activeEvents en las dependencias para evitar
    // que el audio se reinicie cuando llegan nuevos eventos
  }, [isAlarmActive]); // Solo depende de isAlarmActive, no de eventos individuales

  // Efecto adicional para mantener el audio reproduciéndose sin interrupción
  useEffect(() => {
    if (isAlarmActive && audioRef.current && !audioStoppedRef.current) {
      // Verificar cada medio segundo si el audio sigue reproduciéndose
      audioIntervalRef.current = setInterval(() => {
        // IMPORTANTE: Solo verificar si la alarma sigue activa y no ha sido detenida manualmente
        if (isAlarmActive && audioRef.current && !audioStoppedRef.current) {
          if (audioRef.current.paused || audioRef.current.ended) {
            console.log('Audio pausado/terminado detectado, reiniciando...');
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(error => {
              console.log('Error reiniciando audio:', error);
            });
          }
          
          // Verificar que el volumen esté al máximo
          if (audioRef.current.volume !== 1.0) {
            audioRef.current.volume = 1.0;
          }
          
          // Asegurar que no esté muted
          if (audioRef.current.muted) {
            audioRef.current.muted = false;
          }
        } else {
          // Si las condiciones ya no se cumplen, limpiar el intervalo
          if (audioIntervalRef.current) {
            clearInterval(audioIntervalRef.current);
            audioIntervalRef.current = null;
          }
        }
      }, 500); // Verificar cada medio segundo
    }

    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
    };
  }, [isAlarmActive]); // Remover audioStopped de dependencias

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

  // Efecto para manejar cuando la pestaña se oculta o muestra
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Solo actuar si la alarma está activa y no ha sido detenida
      if (isAlarmActive && audioRef.current && !audioStoppedRef.current) {
        if (document.hidden) {
          // Pestaña oculta - asegurar que el audio siga reproduciéndose
          console.log('Pestaña oculta, manteniendo alarma activa');
          if (audioRef.current.paused) {
            audioRef.current.play().catch(error => {
              console.log('Error manteniendo audio en pestaña oculta:', error);
            });
          }
        } else {
          // Pestaña visible - verificar que el audio esté reproduciéndose
          console.log('Pestaña visible, verificando audio');
          if (audioRef.current.paused) {
            audioRef.current.play().catch(error => {
              console.log('Error reiniciando audio al mostrar pestaña:', error);
            });
          }
        }
      }
    };

    const handleFocus = () => {
      // Solo actuar si la alarma está activa y no ha sido detenida
      if (isAlarmActive && audioRef.current && audioRef.current.paused && !audioStoppedRef.current) {
        console.log('Ventana enfocada, reiniciando audio si es necesario');
        audioRef.current.play().catch(error => {
          console.log('Error reiniciando audio al enfocar:', error);
        });
      }
    };

    const handleBlur = () => {
      if (isAlarmActive && audioRef.current && !audioStoppedRef.current) {
        console.log('Ventana desenfocada, manteniendo audio');
        // No pausar el audio cuando se pierde el foco
      }
    };

    // Solo agregar listeners si la alarma está activa
    if (isAlarmActive) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isAlarmActive]);

  const handleDismissAlert = () => {
    console.log('Iniciando desactivación de audio de alarma...');
    
    // 1. Marcar que el audio debe detenerse INMEDIATAMENTE (ANTES de todo lo demás)
    audioStoppedRef.current = true;
    
    // 2. Limpiar INMEDIATAMENTE el intervalo del audio
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    
    // 3. Detener audio INMEDIATAMENTE
    if (audioRef.current) {
      console.log('Deteniendo audio...');
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        
        // Remover todos los event listeners usando las referencias almacenadas
        if (audioListenersRef.current) {
          audioListenersRef.current.forEach(({ event, handler }) => {
            audioRef.current.removeEventListener(event, handler);
          });
          audioListenersRef.current = [];
        }
      } catch (error) {
        console.log('Error deteniendo audio:', error);
      }
      audioRef.current = null;
    }
    
    // 4. Desactivar solo la UI de alarma (mantener los eventos/logs)
    dispatch(alarmsActions.dismissAlarm());

    // 5. Cancelar animaciones
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // 6. Resetear tiempo
    setAlarmTime(0);
    
    // 7. Detener vibración
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
    
    console.log('Audio de alarma desactivado completamente');
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
            {activeEvents.length > 1 && (
              <div style={{ 
                marginTop: '10px', 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: '#ffeb3b',
                backgroundColor: 'rgba(255, 235, 59, 0.1)',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ffeb3b'
              }}>
                ⚠️ {activeEvents.length} alarmas acumuladas
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
                  Todas se desactivarán al presionar el botón
                </div>
              </div>
            )}
            <div style={timeStyles}>
              Tiempo activa: {formatTime(alarmTime)}
            </div>
          </div>
          <button 
            style={alertButtonStyles}
            onClick={handleDismissAlert}
            title={`Desactivar ${activeEvents.length === 1 ? 'alarma' : `todas las ${activeEvents.length} alarmas`}`}
          >
            {activeEvents.length === 1 
              ? 'Desactivar Alarma' 
              : `Desactivar Todas (${activeEvents.length})`
            }
          </button>
        </div>
      )}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={notification.show}
          message={notification.message}
          autoHideDuration={isAlarmActive ? null : snackBarDurationLongMs}
          onClose={(event, reason) => {
            // Prevenir el cierre automático si la alarma está activa
            if (isAlarmActive && reason === 'timeout') {
              return;
            }
            dispatch(alarmsActions.removeNotification(notification.id));
          }}
        />
      ))}
    </>
  );
};

export default connect()(SocketController);
