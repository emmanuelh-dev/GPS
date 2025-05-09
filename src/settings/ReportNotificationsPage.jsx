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
import { Close } from "@mui/icons-material";

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
  // const [history, setHistory] = useState([]);

  // useEffect(()=>{
  //   fetch("/api/events").then(response => response.json()).then(data => {
  //     setHistory(data);
  //   })
  // },[])

  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const hours12 = usePreference("twelveHourFormat");

  const devices = useSelector((state) => state.devices.items);

  const events = useSelector((state) => state.events.items);

  const formatType = (event) =>
    formatNotificationTitle(t, {
      type: event.type,
      attributes: {
        alarms: event.attributes.alarm,
      },
    });

  const geofences = useSelector((state) => state.geofences.items);

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
        {onClose &&         <IconButton
          size="small"
          color="inherit"
          onClick={() => onClose(false)}
        >
          <Close fontSize="small" />
        </IconButton>}

      </Toolbar>
      <List className={classes.drawer} dense>
        {events.map((event) => (
          <ListItemButton
            key={event.id}
            onClick={() => navigate(`/event/${event.id}`)}
            disabled={!event.id}
          >
            <ListItemText
              primary={`${devices[event.deviceId]?.name} • ${formatType(event)} ${geofences && event && geofences[event.geofenceId]?.name}`}
              secondary={formatTime(event.eventTime, "seconds", hours12)}
            />
            <IconButton
              size="small"
              onClick={() => dispatch(eventsActions.delete(event))}
            >
              <DeleteIcon fontSize="small" className={classes.delete} />
            </IconButton>
          </ListItemButton>
        ))}
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