import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatNotificationTitle, formatTime } from "../common/util/formatter";
import { useTranslation } from "../common/components/LocalizationProvider";
import { eventsActions } from "../store";
import { usePreference } from "../common/util/preferences";
import SettingsMenu from "./components/SettingsMenu";
import PageLayout from "../common/components/PageLayout";

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: theme.dimensions.eventsDrawerWidth,
  },
  toolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export const Notifications = ({ open, onClose }) => {
   const [history, setHistory] = useState([]);

   useEffect(()=>{
     fetch("/api/events").then(response => response.json()).then(data => {
       setHistory(data);
     })
   },[])

  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const hours12 = usePreference("twelveHourFormat");

  const devices = useSelector((state) => state.devices.items);

  const events = useSelector((state) => state.events.items);
  // const events = []
  
  const formatType = (event) =>
    formatNotificationTitle(t, {
      type: event.type,
      attributes: {
        alarms: event.attributes.alarm,
      },
    });

  // Función para obtener el icono apropiado para el tipo de evento
  const getEventIcon = (event) => {
    const type = event.type;
    const message = event.attributes?.message || '';
    
    if (type === 'deviceOffline') return '🔴';
    if (type === 'deviceOnline') return '🟢';
    if (type === 'ignitionOn') return '🔑';
    if (type === 'ignitionOff') return '🔒';
    if (message.includes('SOS') || message.includes('sos')) return '🆘';
    if (message.includes('panic')) return '⚠️';
    if (message.includes('speed')) return '🚨';
    if (type === 'geofenceEnter') return '📍';
    if (type === 'geofenceExit') return '📍';
    if (type === 'alarm') return '🚨';
    
    return '📋'; // Icono por defecto
  };

  // Función para limpiar y formatear el mensaje del evento
  const formatEventMessage = (event) => {
    const message = event.attributes?.message || '';
    const deviceName = devices[event.deviceId]?.name || `Device ${event.deviceId}`;
    
    // Limpiar mensajes que contienen información redundante
    if (message.includes('offline at') || message.includes('online at')) {
      // Para eventos de conexión, solo mostrar el estado
      return event.type === 'deviceOffline' ? 'Desconectado' : 'Conectado';
    }
    
    if (message.includes('ignition on') || message.includes('ignition off')) {
      return message.includes('ignition on') ? 'Motor encendido' : 'Motor apagado';
    }
    
    if (message.includes('SOS') || message.includes('sos')) {
      return 'Botón SOS activado';
    }
    
    if (message.includes('panic')) {
      return 'Botón de pánico activado';
    }
    
    if (message.includes('speed')) {
      // Extraer información de velocidad si está disponible
      const speedMatch = message.match(/(\d+\.?\d*)\s*(km\/h|mph)/i);
      if (speedMatch) {
        return `Exceso de velocidad: ${speedMatch[1]} ${speedMatch[2]}`;
      }
      return 'Exceso de velocidad';
    }
    
    if (message.includes('geofence')) {
      return message.includes('entered') ? 'Entrada a zona' : 'Salida de zona';
    }
    
    // Si el mensaje es muy largo, truncarlo y limpiar caracteres extraños
    const cleanMessage = message
      .replace(/\n/g, ' ')  // Remover saltos de línea
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
    
    if (cleanMessage.length > 50) {
      return cleanMessage.substring(0, 47) + '...';
    }
    
    return cleanMessage || formatType(event);
  };

  const geofences = useSelector((state) => state.geofences.items);

  console.log("events", events);

  return (
    <>
      <Toolbar className={classes.toolbar} disableGutters>
        <Typography variant="h6" className={classes.title}>
          {t("reportEvents")}
        </Typography>
        <IconButton
          size="small"
          color="inherit"
          onClick={() => dispatch(eventsActions.deleteAll())}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Toolbar>
      <List className={classes.drawer} dense>
        {events.map((event) => {
          const deviceName = devices[event.deviceId]?.name || `Device ${event.deviceId}`;
          const eventMessage = formatEventMessage(event);
          const eventIcon = getEventIcon(event);
          const geofenceName = geofences && event.geofenceId ? geofences[event.geofenceId]?.name : '';
          
          return (
            <ListItemButton
              key={event.id}
              onClick={() => navigate(`/event/${event.id}`)}
              disabled={!event.id}
              style={{ 
                borderLeft: `4px solid ${event.type === 'deviceOffline' ? '#f44336' : 
                  event.type === 'deviceOnline' ? '#4caf50' : 
                  event.attributes?.message?.includes('SOS') ? '#ff5722' : '#2196f3'}`,
                marginBottom: '2px'
              }}
            >
              <ListItemText
                primary={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>
                      {eventIcon}
                    </span>
                    <span style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {deviceName}
                    </span>
                    <span style={{ color: '#666' }}>•</span>
                    <span>
                      {eventMessage}
                    </span>
                    {geofenceName && (
                      <>
                        <span style={{ color: '#666' }}>•</span>
                        <span style={{ color: '#ff9800', fontSize: '0.9em' }}>
                          {geofenceName}
                        </span>
                      </>
                    )}
                  </div>
                }
                secondary={formatTime(event.eventTime, "seconds", hours12)}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(eventsActions.delete(event));
                }}
              >
                <DeleteIcon fontSize="small" className={classes.delete} />
              </IconButton>
            </ListItemButton>
          );
        })}
      </List>
    </>
  );
};

const ReportNotificationsPage = () => {
  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "sharedNotifications"]}
    >
      <Notifications />
    </PageLayout>
  )
}

export default ReportNotificationsPage;