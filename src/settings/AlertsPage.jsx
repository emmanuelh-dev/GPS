import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Toolbar,
  IconButton,
  ListItemButton
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

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
    width: theme.dimensions.eventsDrawerWidth,
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
  },
}));

const AlertsPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const hours12 = usePreference('twelveHourFormat');

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
      const alerts = await response.json()
      setAlerts(alerts.reverse());
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


  console.log(alerts);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedNotifications']}>
      <Container maxWidth="xs" className={classes.container}>
        <Paper className={classes.details}>
          <Toolbar className={classes.toolbar} disableGutters>
            <Typography variant="h6" className={classes.title}>
              {t('sharedNotifications')}
            </Typography>
            <IconButton size="small" color="inherit" onClick={handleDeleteAll}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Toolbar>
          <Typography variant={'body1'} className={classes.note}>
            Notificaciones (Ultimas 24 horas)
          </Typography>
          <List dense>
            {/* {events.map((event) => (
              <ListItem
                key={event.id}
              >
                <ListItemText
                  primary={`${devices[event.deviceId]?.name} • ${formatType(event)}`}
                  secondary={formatTime(event.eventTime, 'seconds', hours12)}
                />
                <IconButton size="small" onClick={() => handleDeleteEvent(event)}>
                  <DeleteIcon fontSize="small" className={classes.delete} />
                </IconButton>
              </ListItem>
            ))} */}
            {alerts.map((alert) => (
              <ListItemButton
                key={alert.eventId}
                style={{
                  paddingRight: 8
                }}
              >
                <ListItemText
                  primary={formatAlertMessage(alert, devices[alert.deviceId])}
                  secondary={formatTime(alert.alertTime, 'seconds', hours12)}
                />
                <IconButton
                  size="small"
                  onClick={() => handleDeleteAlert(alert)}
                  style={{
                    alignSelf: 'baseline',
                  }}
                >
                  <DeleteIcon fontSize="small" className={classes.delete} />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Container>
    </PageLayout>);
}

export default AlertsPage;
