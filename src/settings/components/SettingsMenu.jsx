import React from 'react';
import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import PeopleIcon from '@mui/icons-material/People';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Create, Dashboard, History } from '@mui/icons-material';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useAdministrator, useManager } from '../../common/util/permissions';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';

const MenuItem = ({ title, link, icon, selected }) => (
  <ListItemButton key={link} component={Link} to={link} selected={selected}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={title} />
  </ListItemButton>
);

const SettingsMenu = () => {
  const t = useTranslation();
  const location = useLocation();

  const admin = useAdministrator();
  const manager = useManager();
  const userId = useSelector((state) => state.session.user.id);

  return (
    <>
      <List>
        {/* <MenuItem
          title={t('sharedPreferences')}
          link='/settings/preferences'
          icon={<SettingsIcon />}
          selected={location.pathname === '/settings/preferences'}
        /> */}
        {admin && (
          <>
            <MenuItem
              title='Dashboard'
              link='/settings/dashboard'
              icon={<Dashboard />}
              selected={location.pathname.startsWith('/settings/dashboard')}
            />
            <MenuItem
              title={t('deviceTitle')}
              link='/settings/devices'
              icon={<SmartphoneIcon />}
              selected={location.pathname.startsWith('/settings/device')}
            />
            <MenuItem
              title='Chismografo'
              link='/settings/chismografo'
              icon={<History />}
              selected={location.pathname.startsWith('/settings/chismografo')}
            />
          </>
        )}
        <MenuItem
          title={t('sharedGeofences')}
          link='/geofences'
          icon={<Create />}
          selected={location.pathname.startsWith('/settings/geofence')}
        />
        <MenuItem
          title={t('sharedGeofence')}
          link="/reports/geofence"
          icon={<ShareLocationIcon />}
          selected={location.pathname === '/reports/geofence'}
        />
        <MenuItem
          title={t('settingsUsers')}
          link='/settings/users'
          icon={<PeopleIcon />}
          selected={
            location.pathname.startsWith('/settings/user') &&
            location.pathname !== `/settings/user/${userId}`
          }
        />
        {/* {!readonly && (
          <>
            <MenuItem
              title={t('sharedNotifications')}
              link="/settings/notifications"
              icon={<NotificationsIcon />}
              selected={location.pathname.startsWith('/settings/notification')}
            />
            <MenuItem
              title={t('settingsUser')}
              link={`/settings/user/${userId}`}
              icon={<PersonIcon />}
              selected={location.pathname === `/settings/user/${userId}`}
            />
            <MenuItem
              title={t('deviceTitle')}
              link="/settings/devices"
              icon={<SmartphoneIcon />}
              selected={location.pathname.startsWith('/settings/device')}
            />
            <MenuItem
              title={t('sharedGeofences')}
              link="/geofences"
              icon={<Create />}
              selected={location.pathname.startsWith('/settings/geofence')}
            />
            {!features.disableGroups && (
              <MenuItem
                title={t('settingsGroups')}
                link="/settings/groups"
                icon={<FolderIcon />}
                selected={location.pathname.startsWith('/settings/group')}
              />
            )}
            {!features.disableDrivers && (
              <MenuItem
                title={t('sharedDrivers')}
                link="/settings/drivers"
                icon={<PersonIcon />}
                selected={location.pathname.startsWith('/settings/driver')}
              />
            )}
            {!features.disableCalendars && (
              <MenuItem
                title={t('sharedCalendars')}
                link="/settings/calendars"
                icon={<TodayIcon />}
                selected={location.pathname.startsWith('/settings/calendar')}
              />
            )}
            {!features.disableComputedAttributes && (
              <MenuItem
                title={t('sharedComputedAttributes')}
                link="/settings/attributes"
                icon={<StorageIcon />}
                selected={location.pathname.startsWith('/settings/attribute')}
              />
            )}
            {!features.disableMaintenance && (
              <MenuItem
                title={t('sharedMaintenance')}
                link="/settings/maintenances"
                icon={<BuildIcon />}
                selected={location.pathname.startsWith('/settings/maintenance')}
              />
            )}
            <MenuItem
              title={t('sharedSavedCommands')}
              link="/settings/commands"
              icon={<PublishIcon />}
              selected={location.pathname.startsWith('/settings/command')}
            />
          </>
        )} */}
      </List>
      {manager && (
        <>
          <Divider />
          <List>
            {admin && (
              <MenuItem
                title={t('settingsServer')}
                link='/settings/server'
                icon={<StorageIcon />}
                selected={location.pathname === '/settings/server'}
              />
            )}
          </List>
        </>
      )}
    </>
  );
};

export default SettingsMenu;
