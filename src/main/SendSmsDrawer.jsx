import React, { useState } from 'react';
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
import { sendSMS, checkStatus, resetRed } from '../common/util/sms';

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: theme.dimensions.eventsDrawerWidth,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  title: {
    display: 'flex',
    flexDirection: 'column',
  },
  section: {
  },
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  button: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  closeButton: {
    marginTop: theme.spacing(1),
    marginLeft: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  buttonDanger: {
    backgroundColor: theme.palette.error.main,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  box: {
    paddingTop: theme.spacing(2),
  },
  tooltipButton: {
    color: theme.palette.primary.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
}));

const COMMANDS = [
  'apn123456 m2mglobal.telefonica.mx',
  'dns123456 24.199.121.252 5001',
  'angle123456 30',
  'fix090s***n123456',
  'sleep123456 on',
];

const TeltonikaCommands = [
  'setparam 2001:m2mglobal.telefonica.mx',
  'setparam 2004:24.199.121.252',
  'setparam 2005:5027',
  'setparam 2006:0',
];
const SendSmsDrawer = ({ deviceId }) => {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState();

  const device = useSelector((state) => state.devices.items[deviceId]);
  const { sendSmsOpen } = useSelector((state) => state.devices);
  const handleCommandChange = (event) => {
    setCommand(event.target.value);
  };

  const handleSendSMS = () => {
    sendSMS({ phoneNumber: device.phone, message: command });
  };

  async function handleCheckStatus() {
    setLoading(true);

    const { data } = await checkStatus({ phoneNumber: device.phone });

    setStatus(data);
    setLoading(false);
  }
  const classes = useStyles();
  const dispatch = useDispatch();
  const toggleSendSms = () => {
    dispatch(devicesActions.toggleSendSms());
  };

  return (
    <Drawer
      anchor="right"
      open={sendSmsOpen}
      onClose={toggleSendSms}
    >
      <Toolbar className={classes.toolbar} disableGutters>
        <IconButton size="small" color="inherit" onClick={toggleSendSms} className={classes.closeButton}>
          <Close fontSize="small" />
        </IconButton>
        <div className="w-full">
          <Typography variant="h6" className={classes.section}>
            <span className="block">{`Device Status: ${device?.name}`}</span>
            <span className="block">{`Device IMEI: ${device?.phone}`}</span>
          </Typography>
        </div>

      </Toolbar>

      <List className={classes.drawer} dense>
        <Button
          className={classes.buttonDanger}
          onClick={() => resetRed({ phoneNumber: device.phone })}
          variant="contained"
          fullWidth
          sx={{ marginTop: 1 }}
        >
          Reset SIM
        </Button>
        <Button
          className={classes.button}
          onClick={() => handleCheckStatus()}
          variant="contained"
          fullWidth
          sx={{ marginTop: 1 }}
        >
          Iniciar Diagnóstico
        </Button>
        <Box className={classes.box}>
          {loading && (
          <CircularProgress />
          )}
          {status && (
            <>
              <Typography>
                GSM status:
                {' '}
                <span>{status.gsm.result}</span>
              </Typography>
              <Typography>
                GPRS status:
                {' '}
                <span>{status.gprs.result}</span>
              </Typography>
            </>
          )}
        </Box>

        <Toolbar className={classes.section} disableGutters>
          <Typography variant="h6" className={classes.title}>
            Coban
          </Typography>
        </Toolbar>
        {COMMANDS.map((cmd) => (
          <Button key={cmd} onClick={() => setCommand(cmd)}>
            {cmd}
          </Button>
        ))}
        <Toolbar className={classes.section} disableGutters>
          <Typography variant="h6" className={classes.title}>
            Teltonika
          </Typography>
        </Toolbar>
        {TeltonikaCommands.map((cmd) => (
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
          className={classes.button}
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
