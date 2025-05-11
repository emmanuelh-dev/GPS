import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  List,
  TextField,
  Toolbar,
  Typography,
  Chip,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import { Close, ExpandMore } from "@mui/icons-material";
import { devicesActions } from "../store";
import { sendSMS, checkStatus, resetRed, getSimInfo } from "../common/util/sms";
import zIndex from "@mui/material/styles/zIndex";

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: theme.dimensions.eventsDrawerWidth,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  toolbar: {
    display: "flex",
    flexDirection: "column",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  title: {
    display: "flex",
    flexDirection: "column",
  },
  section: {},
  flexCol: {
    display: "flex",
    flexDirection: "column",
  },
  button: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  closeButton: {
    marginTop: theme.spacing(1),
    marginLeft: "auto",
    display: "flex",
    justifyContent: "flex-end",
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
  accordion: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  accordionSummary: {
    backgroundColor: theme.palette.action.hover,
  },
  accordionDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));

const DEVICE_COMMANDS = {
  coban: [
    "apn123456 m2mglobal.telefonica.mx",
    "dns123456 24.199.121.252 5001",
    "angle123456 30",
    "fix090s***n123456",
    "sleep123456 on",
  ],
  teltonika: [
    "  flush 865413051478385,m2mglobal.telefonica.mx,,, 24.199.121.252, 5027,,",
    "  setdigout 1",
    "  setdigout 0",
  ],
  solar: [
    "APN,m2mglobal.telefonica.mx#",
    "APNUSER,#",
    "APNPASS,#",
    "GPRS,ON#",
    "SERVER,1,gps.gonzher.com,5023#",
    "MODE,2,60,300,1,0,1,1,1#",
    "RESET#"
  ]
};
const SendSmsDrawer = () => {
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState();
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [isMassMode, setIsMassMode] = useState(false);
  const [simInfo, setSimInfo] = useState(null);
  const [loadingSimInfo, setLoadingSimInfo] = useState(false);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const device = useSelector((state) => state.devices.items[selectedDeviceId]);
  const devices = useSelector((state) => state.devices.items);

  const { sendSmsOpen, massSmsOpen, massSmsDevices } = useSelector((state) => state.devices);

  const handleCommandChange = (event) => {
    setCommand(event.target.value);
  };

  useEffect(() => {
    if (massSmsDevices && massSmsDevices.length > 0) {
      setIsMassMode(true);
      setSelectedDevices(massSmsDevices);
    } else {
      setIsMassMode(false);
      setSelectedDevices([]);
    }
  }, [massSmsDevices]);

  const handleSendSMS = () => {
    if (isMassMode && selectedDevices.length > 0) {
      selectedDevices.forEach(deviceId => {
        const targetDevice = devices[deviceId];
        if (targetDevice && targetDevice.phone) {
          sendSMS({ phoneNumber: targetDevice.phone, message: command });
        }
      });
    } else {
      sendSMS({ phoneNumber: device.phone, message: command });
    }
  };

  async function handleCheckStatus() {
    setLoading(true);

    const { data } = await checkStatus({ phoneNumber: device.phone });

    setStatus(data);
    setLoading(false);
  }

  async function handleGetSimInfo() {
    if (!device?.phone) return;
    
    setLoadingSimInfo(true);
    try {
      const {data} = await getSimInfo({phoneNumber: device?.phone});
      setSimInfo(data);
    } catch (error) {
      console.error('Error al obtener información de la SIM:', error);
    } finally {
      setLoadingSimInfo(false);
    }
  }
  const classes = useStyles();
  const dispatch = useDispatch();

  const handleClose = () => {
    if (sendSmsOpen) {
      dispatch(devicesActions.toggleSendSms());
    }
    if (massSmsOpen) {
      dispatch(devicesActions.toggleMassSms());
    }
  };

  return (
    <Drawer 
      anchor="right" 
      open={sendSmsOpen || massSmsOpen} 
      onClose={handleClose}
      sx={{
        zIndex: 1000
      }}
    >
      <Toolbar className={classes.toolbar} disableGutters>
        <IconButton
          size="small"
          color="inherit"
          onClick={handleClose}
          className={classes.closeButton}
        >
          <Close fontSize="small" />
        </IconButton>
        <div className="w-full">
          {isMassMode ? (
            <Typography variant="h6" className={classes.section}>
              <span className="block">Envío masivo de SMS</span>
              <span className="block">{`Dispositivos seleccionados: ${selectedDevices.length}`}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {selectedDevices.slice(0, 5).map(deviceId => (
                  <Chip 
                    key={deviceId} 
                    label={devices[deviceId]?.name || deviceId} 
                    size="small" 
                  />
                ))}
                {selectedDevices.length > 5 && (
                  <Chip 
                    label={`+${selectedDevices.length - 5} más`} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
              </div>
            </Typography>
          ) : (
            <Typography variant="h6" className={classes.section}>
              <span className="block">{`Device Status: ${device?.name}`}</span>
              <span className="block">{`Device ICC: ${device?.phone}`}</span>
              <span className="block">{`Device IMEI: ${device?.uniqueId}`}</span>
            </Typography>
          )}
        </div>
      </Toolbar>

      <List className={classes.drawer} dense>
        {!isMassMode && (
          <>
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
            <Button
              className={classes.button}
              onClick={() => handleGetSimInfo()}
              variant="contained"
              fullWidth
              sx={{ marginTop: 1 }}
            >
              Obtener Info SIM
            </Button>
          </>
        )}
        <Box className={classes.box}>
          {loading && <CircularProgress />}
          {status && (
            <>
              <Typography>
                GSM status: <span>{status.gsm.result}</span>
              </Typography>
              <Typography>
                GPRS status: <span>{status.gprs.result}</span>
              </Typography>
            </>
          )}
        </Box>

        {loadingSimInfo && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={24} />
          </Box>
        )}

        {simInfo && simInfo.iccs && simInfo.iccs.length > 0 && (
          <Accordion className={classes.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              className={classes.accordionSummary}
            >
              <Typography variant="h6" className={classes.title}>
                Información de la SIM
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
                {/* Información general */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>Información General</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">ICC: {simInfo.iccs[0].icc || 'No disponible'}</Typography>
                    <Typography variant="body2">IMSI: {simInfo.iccs[0].imsi || 'No disponible'}</Typography>
                    <Typography variant="body2">MSISDN: {simInfo.iccs[0].msisdn || 'No disponible'}</Typography>
                    <Typography variant="body2">Estado: {simInfo.iccs[0].state || 'No disponible'}</Typography>
                    <Typography variant="body2">Operador: {simInfo.iccs[0].operator || 'No disponible'}</Typography>
                    <Typography variant="body2">Tecnología: {simInfo.iccs[0].tecnology || 'No disponible'}</Typography>
                    <Typography variant="body2">APN: {simInfo.iccs[0].apn || 'No disponible'}</Typography>
                    <Typography variant="body2">IP: {simInfo.iccs[0].ip || 'No disponible'}</Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Consumo */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>Consumo</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="subtitle2">Consumo Diario:</Typography>
                    <Typography variant="body2">Datos: {simInfo.iccs[0].consumptionDaily?.data?.value || 0} MB</Typography>
                    <Typography variant="body2">SMS: {simInfo.iccs[0].consumptionDaily?.sms?.value || 0}</Typography>
                    <Typography variant="body2">Voz: {simInfo.iccs[0].consumptionDaily?.voice?.value || 0} min</Typography>
                    
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>Consumo Mensual:</Typography>
                    <Typography variant="body2">Datos: {simInfo.iccs[0].consumptionMonthly?.data?.value || 0} MB</Typography>
                    <Typography variant="body2">SMS: {simInfo.iccs[0].consumptionMonthly?.sms?.value || 0}</Typography>
                    <Typography variant="body2">Voz: {simInfo.iccs[0].consumptionMonthly?.voice?.value || 0} min</Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Estado de conexión */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>Estado de Conexión</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">Estado GPRS: {simInfo.iccs[0].gprsStatus?.status === 1 ? 'Conectado' : 'Desconectado'}</Typography>
                    {simInfo.iccs[0].gprsStatus?.lastConnStart && (
                      <Typography variant="body2">Última conexión: {new Date(simInfo.iccs[0].gprsStatus.lastConnStart).toLocaleString()}</Typography>
                    )}
                    {simInfo.iccs[0].gprsStatus?.lastConnStop && (
                      <Typography variant="body2">Última desconexión: {new Date(simInfo.iccs[0].gprsStatus.lastConnStop).toLocaleString()}</Typography>
                    )}
                    <Typography variant="body2">Estado IP: {simInfo.iccs[0].ipStatus?.status === 1 ? 'Activa' : 'Inactiva'}</Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Detalles técnicos */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>Detalles Técnicos</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">IMEI: {simInfo.iccs[0].imei || 'No disponible'}</Typography>
                    {simInfo.iccs[0].imei_change && (
                      <Typography variant="body2">Cambio de IMEI: {new Date(simInfo.iccs[0].imei_change).toLocaleDateString()}</Typography>
                    )}
                    {simInfo.iccs[0].activation_date && (
                      <Typography variant="body2">Fecha de activación: {new Date(simInfo.iccs[0].activation_date).toLocaleDateString()}</Typography>
                    )}
                    {simInfo.iccs[0].lastStateChangeDate && (
                      <Typography variant="body2">Último cambio de estado: {new Date(simInfo.iccs[0].lastStateChangeDate).toLocaleDateString()}</Typography>
                    )}
                    <Typography variant="body2">Tipo de SIM: {simInfo.iccs[0].sim_type || 'No disponible'}</Typography>
                    <Typography variant="body2">Modelo de SIM: {simInfo.iccs[0].sim_model || 'No disponible'}</Typography>
                    <Typography variant="body2">LTE habilitado: {simInfo.iccs[0].lteEnabled ? 'Sí' : 'No'}</Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
        
        {simInfo && (!simInfo.iccs || simInfo.iccs.length === 0) && (
          <Box sx={{ my: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography color="error">No se encontró información para esta SIM</Typography>
          </Box>
        )}

        {Object.entries(DEVICE_COMMANDS).map(([deviceType, commands]) => (
          <Accordion key={deviceType} className={classes.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              className={classes.accordionSummary}
            >
              <Typography variant="h6" className={classes.title}>
                {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              {commands.map((cmd) => (
                <Button key={cmd} onClick={() => setCommand(cmd)} fullWidth variant="outlined">
                  {cmd}
                </Button>
              ))}
            </AccordionDetails>
          </Accordion>
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
