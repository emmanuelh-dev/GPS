import React, { useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Toolbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import makeStyles from '@mui/styles/makeStyles';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import { useCatch, useEffectAsync } from '../reactHelper';
import PageLayout from '../common/components/PageLayout';
import { formatAlertMessage, formatNotificationTitle, formatTime } from '../common/util/formatter';
import { usePreference } from '../common/util/preferences';
import dayjs from 'dayjs';
import { eventsActions } from '../store';
import { Settings } from '@mui/icons-material';
import PDFAlertsButton from '../reports/PDFAlertsButton';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
    width: '100%',
    maxWidth: 1000,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: theme.spacing(3),
  },
  toolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  title: {
    flexGrow: 1,
  },
  note: {
    flexGrow: 1,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  tableContainer: {
    marginTop: theme.spacing(1),
  },
  actionCell: {
    width: '80px',
  },
}));

const AlertsPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const hours12 = usePreference('twelveHourFormat');
  const geofences = useSelector((state) => state.geofences.items);

  const devices = useSelector((state) => state.devices.items);

  const events = useSelector((state) => state.events.items);

  const [alerts, setAlerts] = useState([]);

  const formatType = (event) => formatNotificationTitle(t, {
    type: event.type,
    attributes: {
      alarms: event.attributes.alarm,
    },
  });

  useEffectAsync(async () => {
    const query = new URLSearchParams({
      from: dayjs().subtract(24, 'hours').toISOString(),
      to: dayjs().toISOString(), // now
    });
    const response = await fetch(`/api/reports/alerts?${query.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const alertsData = await response.json();
      
      const uniqueAlertsMap = new Map();
      alertsData.forEach(alert => {
        if (!uniqueAlertsMap.has(alert.eventId) || 
            new Date(alert.alertTime) > new Date(uniqueAlertsMap.get(alert.eventId).alertTime)) {
          uniqueAlertsMap.set(alert.eventId, alert);
        }
      });
      
      const uniqueAlerts = Array.from(uniqueAlertsMap.values());
      setAlerts(uniqueAlerts.reverse());
    } else {
      throw Error(await response.text());
    }
  }, [events]);

  const handleDeleteAlert = (alert) => {
    setAlerts(alerts.filter(item => item.id != alert.id))
    handleRemove(alert.eventId);
  }

  const handleDeleteEvent = (event) => {
    dispatch(eventsActions.delete(event));
    handleRemove(event.id);
  }

  const handleDeleteAll = () => {
    dispatch(eventsActions.deleteAll());
    setAlerts([]);
    handleRemoveAll();
  }

  const handleRemove = useCatch(async (itemId) => {
    const response = await fetch(`/api/events/alerts/${itemId}`, { method: 'DELETE' });
    if (response.ok) {
    } else {
      throw Error(await response.text());
    }
  });

  const handleRemoveAll = useCatch(async () => {
    const response = await fetch("/api/reports/alerts", { method: 'DELETE' });
    if (response.ok) {
    } else {
      throw Error(await response.text());
    }
  });

console.log(geofences)
  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedNotifications']}>
      <Container className={classes.container}>
        <Paper className={classes.details}>
          <Toolbar className={classes.toolbar} disableGutters>
            <Typography variant="h6" className={classes.title}>
              {t('sharedNotifications')}
            </Typography>
            <NavLink to="/settings/notifications/setup">
            <IconButton size="small" color="inherit" onClick={handleDeleteAll}>
              <Settings fontSize="small" />
            </IconButton>
            </NavLink>
            <PDFAlertsButton
              alerts={alerts}
              devices={devices}
              formatAlertMessage={formatAlertMessage}
            />
            <IconButton size="small" color="inherit" onClick={handleDeleteAll}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Toolbar>
          <Typography variant={'body1'} className={classes.note}>
            Notificaciones (Ultimas 24 horas)
          </Typography>
          <TableContainer className={classes.tableContainer}>
            <Table size="small" aria-label="alerts table">
              <TableHead>
                <TableRow>
                  <TableCell>Dispositivo</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Mensaje</TableCell>
                  <TableCell>Fecha/Hora</TableCell>
                  <TableCell align="center" className={classes.actionCell}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.eventId}>
                    <TableCell>{devices[alert.deviceId]?.name || 'Desconocido'}</TableCell>
                    <TableCell>{alert.type || 'N/A'}</TableCell>
                    <TableCell>{formatAlertMessage(alert, devices[alert.deviceId])}</TableCell>
                    <TableCell>{formatTime(alert.alertTime, 'seconds', hours12)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteAlert(alert)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {alerts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No tienes notificaciones nuevas. Puedes comenzar a configurarlas en la pestaña de Notificaciones.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </PageLayout>);
}

export default AlertsPage;