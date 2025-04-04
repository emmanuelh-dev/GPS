import React, { Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import {
  Divider, List, ListItemButton, ListItemText, ListItemIcon,
  Checkbox,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

import { geofencesActions } from '../store';
import CollectionActions from '../settings/components/CollectionActions';
import { useCatchCallback } from '../reactHelper';

const useStyles = makeStyles(() => ({
  list: {
    maxHeight: '100%',
    overflow: 'auto',
  },
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  notificationIcon: {
    minWidth: 'auto',
    marginRight: '8px',
  },
}));

const GeofencesList = ({ onGeofenceSelected }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const items = useSelector((state) => state.geofences.items);
  const currentUser = useSelector((state) => state.session.user);

  const refreshGeofences = useCatchCallback(async () => {
    const response = await fetch('/api/geofences');
    if (response.ok) {
      dispatch(geofencesActions.refresh(await response.json()));
    } else {
      throw Error(await response.text());
    }
  }, [dispatch]);

  const onGeofenceEnabled = async (item, enabled) => {
    const updatedGeofence = { ...item, notify: enabled, userId: currentUser.id, };
    dispatch(geofencesActions.update([updatedGeofence]));

    try {
      const response = await fetch(`/api/geofences/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGeofence)
      });

      if (!response.ok) {
        // Revert the optimistic update if the API call fails
        dispatch(geofencesActions.update([item]));
        throw Error(await response.text());
      }
      setSnackbar({
        open: true,
        message: `Notificaciones ${enabled ? 'activadas' : 'desactivadas'} para ${item.name}`,
        severity: 'success'
      });
    } catch (error) {
      console.error(error);
      // Revert the optimistic update on any error
      dispatch(geofencesActions.update([item]));
      setSnackbar({
        open: true,
        message: 'Error al actualizar las notificaciones',
        severity: 'error'
      });
    }
  };

  return (
    <>
      <List className={classes.list}>
      {Object.values(items).map((item, index, list) => (
        <Fragment key={item.id}>
          <ListItemButton key={item.id} onClick={() => onGeofenceSelected(item.id)}>

            <ListItemText primary={item.name} />

            <Tooltip title="Notificar">
              <IconButton size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onGeofenceEnabled(item, !item.notify);
                }}>
                <ListItemIcon
                  className={classes.notificationIcon}
                  style={{ cursor: 'pointer' }}
                >
                  {item.notify ? <NotificationsActiveIcon color="primary" /> : <NotificationsOffIcon color="disabled" />}
                </ListItemIcon>
              </IconButton>
            </Tooltip>
            <CollectionActions itemId={item.id} editPath="/settings/geofence" endpoint="geofences" setTimestamp={refreshGeofences} />
          </ListItemButton>
          {index < list.length - 1 ? <Divider /> : null}
        </Fragment>
      ))}
    </List>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal:'right' }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GeofencesList;