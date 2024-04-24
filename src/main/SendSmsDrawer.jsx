import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  CircularProgress,
  Drawer, IconButton, List, TextField, Toolbar, Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import { Close } from '@mui/icons-material';
import { devicesActions } from '../store';
import { sendSMS } from '../common/util/sms';

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: theme.dimensions.eventsDrawerWidth,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  toolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  button: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

const COMMANDS = [
  'apn123456 m2mglobal.telefonica.mx',
  'dns123456 24.199.121.252 5001',
  'angle123456 30',
  'fix060s***n123456',
  'sleep123456 on',
];

const SendSmsDrawer = ({ deviceId }) => {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({
    GSM: '',
    GPRS: '',

  });

  const device = useSelector((state) => state.devices.items[deviceId]);
  const { sendSmsOpen } = useSelector((state) => state.devices);
  const handleCommandChange = (event) => {
    setCommand(event.target.value);
  };

  const handleSendSMS = () => {
    sendSMS({ phoneNumber: device.phone, command });
  };

  const handleLoading = () => {
    setLoading(true);
  };
  const classes = useStyles();
  const dispatch = useDispatch();
  const toggleSendSms = () => {
    dispatch(devicesActions.toggleSendSms());
  };
  useEffect(() => {
    setStatus({
      GSM: 'OK',
      GPRS: 'OK',
    });
  }, []);

  return (
    <Drawer
      anchor="right"
      open={sendSmsOpen}
      onClose={toggleSendSms}
    >
      <Toolbar className={classes.toolbar} disableGutters>
        <Typography variant="h6" className={classes.title}>
          Device Status:
          {' '}
          {device.name}
        </Typography>
        <IconButton size="small" color="inherit" onClick={toggleSendSms}>
          <Close fontSize="small" />
        </IconButton>
      </Toolbar>

      <List className={classes.drawer} dense>
        <Button
          className={classes.button}
          onClick={handleLoading}
          variant="contained"
          fullWidth
          sx={{ marginTop: 1 }}
        >
          Iniciar Diagnóstico
        </Button>
        {
          loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          )
        }
        {
          status.GSM !== '' && (
            <div>
              <Typography>
                GSM status:
                {status.GSM}
              </Typography>
              <Typography>
                GPRS status:
                {status.GPRS}
              </Typography>
            </div>
          )
        }
        {COMMANDS.map((cmd) => (
          <Button key={cmd} onClick={() => setCommand(cmd)}>
            {cmd}
          </Button>
        ))}
        <TextField
          label="Comando"
          variant="filled"
          fullWidth
          value={command}
          onChange={handleCommandChange}
        />
        <Button
          variant="contained"
          onClick={handleSendSMS}
          fullWidth
          sx={{ marginTop: 1 }}
        >
          Enviar
        </Button>
      </List>
    </Drawer>
  );
};

export default SendSmsDrawer;
