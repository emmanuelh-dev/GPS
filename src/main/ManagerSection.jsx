import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  Box,
  IconButton,
  Tooltip,
  Container,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatch } from '../reactHelper';
import { formatTime } from '../common/util/formatter';
import { usePreference } from '../common/util/preferences';
import { FaUserCircle } from 'react-icons/fa';
import LoginIcon from '@mui/icons-material/Login';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 5,
  },
  userListContainer: {
    width: '100%',
    height: '50%',
    overflow: 'auto',
    overflowX: 'hidden',
  },
  notificationsContainer: {
    width: '100%',
    height: '50%',
    overflow: 'auto',
    overflowX: 'hidden',
  },
  userItem: {
    marginBottom: theme.spacing(1),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0.5, 1),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  loginButton: {
    minWidth: 'auto',
    padding: theme.spacing(0.5),
  },
  sectionTitle: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationItem: {
    marginBottom: theme.spacing(1),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0.5, 1),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  userEmail: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
  userName: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontWeight: 'bold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
  noData: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  searchContainer: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  searchField: {
    width: '100%',
    marginBottom: theme.spacing(1),
  },
}));

const ManagerSection = () => {
  const classes = useStyles();
  const t = useTranslation();
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const hours12 = usePreference('twelveHourFormat');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtrar usuarios basado en la búsqueda
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogin = useCatch(async (userId) => {
    const response = await fetch(`/api/session/${userId}`);
    if (response.ok) {
      window.location.replace('/');
    } else {
      throw Error(await response.text());
    }
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.filter(user => !user.disabled));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          setNotifications(await response.json());
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={classes.container}>
      <Paper elevation={3} className={classes.userListContainer}>
        <div className={classes.sectionTitle}>
          <div className={classes.sectionHeader}>
            <PersonIcon />
            <Typography variant="subtitle1">
              {t('settingsUsers')}
            </Typography>
          </div>
          <Typography variant="caption">
            Operadores
          </Typography>
        </div>
        <div className={classes.searchContainer}>
          <TextField
            className={classes.searchField}
            placeholder={t('sharedSearch')}
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </div>
        <List dense style={{ padding: 0 }}>
          {filteredUsers.slice(0, 10).map((user) => (
            <ListItem key={user.id} className={classes.userItem}>
              <ListItemAvatar>
                <Avatar className={classes.avatar}>
                  <FaUserCircle />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <div className={classes.userName}>
                    {user.name}
                  </div>
                }
                secondary={
                  <div className={classes.userEmail}>
                    <EmailIcon fontSize="small" />
                    {user.email}
                  </div>
                }
                primaryTypographyProps={{ noWrap: true }}
                secondaryTypographyProps={{ noWrap: true }}
                style={{ overflow: 'hidden', width: '100%' }}
              />
              <Tooltip title={t('loginLogin')}>
                <IconButton
                  edge="end"
                  color="primary"
                  onClick={() => handleLogin(user.id)}
                  className={classes.loginButton}
                >
                  <LoginIcon />
                </IconButton>
              </Tooltip>
            </ListItem>
          ))}
          {users.length === 0 && (
            <div className={classes.noData}>
              {t('sharedNoData')}
            </div>
          )}
        </List>
      </Paper>
      
      <Paper elevation={3} className={classes.notificationsContainer}>
        <div className={classes.sectionTitle}>
          <div className={classes.sectionHeader}>
            <NotificationsIcon />
            <Typography variant="subtitle1">
              {t('sharedNotifications')}
            </Typography>
          </div>
        </div>
        <List dense style={{ padding: 0 }}>
          {notifications.slice(0, 10).map((notification) => (
            <ListItem key={notification.id} className={classes.notificationItem}>
              <ListItemAvatar>
                <Avatar className={classes.avatar}>
                  <NotificationsIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={notification.attributes?.message || t('sharedNotifications')}
                secondary={formatTime(notification.eventTime, 'seconds', hours12)}
                primaryTypographyProps={{ noWrap: true }}
                secondaryTypographyProps={{ noWrap: true }}
                style={{ overflow: 'hidden', width: '100%' }}
              />
            </ListItem>
          ))}
          {notifications.length === 0 && (
            <div className={classes.noData}>
              {t('sharedNoData')}
            </div>
          )}
        </List>
      </Paper>
    </div>
  );
};

export default ManagerSection;