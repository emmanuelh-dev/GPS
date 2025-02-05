import React from "react";
import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import TimelineIcon from "@mui/icons-material/Timeline";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";
import RouteIcon from "@mui/icons-material/Route";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import ShareLocationIcon from '@mui/icons-material/ShareLocation';
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "../../common/components/LocalizationProvider";
import {
  useAdministrator,
  useRestriction,
} from "../../common/util/permissions";

const MenuItem = ({ title, link, icon, selected }) => (
  <ListItemButton key={link} component={Link} to={link} selected={selected}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={title} />
  </ListItemButton>
);

const ReportsMenu = () => {
  const t = useTranslation();
  const location = useLocation();

  const admin = useAdministrator();
  const readonly = useRestriction("readonly");

  return (
    <>
      <List>
        <MenuItem
          title={t("reportCombined")}
          link="/reports/combined"
          icon={<StarIcon />}
          selected={location.pathname === "/reports/combined"}
        />
        <MenuItem
          title={t("reportEvents")}
          link="/reports/event"
          icon={<NotificationsActiveIcon />}
          selected={location.pathname === "/reports/event"}
        />
        <MenuItem
          title="Reporte de Geozona"
          link="/reports/geofence"
          icon={<ShareLocationIcon />}
          selected={location.pathname === '/reports/geofence'}
        />
        <MenuItem
          title={t("reportSummary")}
          link="/reports/summary"
          icon={<FormatListBulletedIcon />}
          selected={location.pathname === "/reports/summary"}
        />
        <MenuItem
          title={t("reportChart")}
          link="/reports/chart"
          icon={<TrendingUpIcon />}
          selected={location.pathname === "/reports/chart"}
        />
        <MenuItem
          title={t("reportReplay")}
          link="/historial"
          icon={<RouteIcon />}
        />
      </List>
      {(admin || !readonly) && (
        <>
          <Divider />
          <List>
            <MenuItem
              title={t("reportScheduled")}
              link="/reports/scheduled"
              icon={<EventRepeatIcon />}
            />
            {admin && (
              <MenuItem
                title={t("statisticsTitle")}
                link="/reports/statistics"
                icon={<BarChartIcon />}
                selected={location.pathname === "/reports/statistics"}
              />
            )}
          </List>
        </>
      )}
    </>
  );
};

export default ReportsMenu;
