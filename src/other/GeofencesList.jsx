import React, { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import {
  Divider, List, ListItemButton, ListItemText, ListItemIcon,
  Checkbox,
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

  const items = useSelector((state) => state.geofences.items);

  const refreshGeofences = useCatchCallback(async () => {
    const response = await fetch('/api/geofences');
    if (response.ok) {
      dispatch(geofencesActions.refresh(await response.json()));
    } else {
      throw Error(await response.text());
    }
  }, [dispatch]);

  const onGeofenceEnabled = async (item, enabled) => {
    const updatedGeofence = { ...item, notify: enabled };
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
    } catch (error) {
      console.error(error);
      // Revert the optimistic update on any error
      dispatch(geofencesActions.update([item]));
    }
  };

  return (
    <List className={classes.list}>
      {Object.values(items).map((item, index, list) => (
        <Fragment key={item.id}>
          <ListItemButton key={item.id} onClick={() => onGeofenceSelected(item.id)}>
            <ListItemIcon className={classes.notificationIcon}>
              {item.notify ? <NotificationsActiveIcon color="primary" /> : <NotificationsOffIcon color="disabled" />}
            </ListItemIcon>
            <ListItemText primary={item.name} />
            <Checkbox checked={item.notify} onChange={(e) => onGeofenceEnabled(item, e.target.checked)} />
            <CollectionActions itemId={item.id} editPath="/settings/geofence" endpoint="geofences" setTimestamp={refreshGeofences} />
          </ListItemButton>
          {index < list.length - 1 ? <Divider /> : null}
        </Fragment>
      ))}    
    </List>
  );
};

export default GeofencesList;