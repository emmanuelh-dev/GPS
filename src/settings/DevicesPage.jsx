import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TableFooter,
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import { usePreference } from '../common/util/preferences';
import { formatTime } from '../common/util/formatter';
import { useDeviceReadonly, useManager } from '../common/util/permissions';
import useSettingsStyles from './common/useSettingsStyles';
import usePersistedState from '../common/util/usePersistedState';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    position: 'sticky',
    padding: theme.spacing(3, 2, 2),
  },
  item: {
    padding: theme.spacing(3, 2, 2),
    textAlign: 'center',
    fontWeight: 'bold',
  },
  ...useSettingsStyles,
}));

const DevicesPage = () => {
  const classes = useStyles();

  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();

  const groups = useSelector((state) => state.groups.items);

  const hours12 = usePreference('twelveHourFormat');

  const deviceReadonly = useDeviceReadonly();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showAll, setShowAll] = usePersistedState('showAllDevices', false);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/devices');
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const handleExport = () => {
    window.location.assign('/api/reports/devices/xlsx');
  };

  const handleToggleSpeedometer = async (deviceId, currentValue) => {
    const newValue = currentValue ? 0 : 80; // Default to 80 when enabling, 0 when disabling
    const updatedItems = items.map(item => {
      if (item.id === deviceId) {
        return { ...item, attributes: { ...item.attributes, speedometer: newValue } };
      }
      return item;
    });
    setItems(updatedItems);

    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems.find(item => item.id === deviceId))
      });
      if (!response.ok) {
        throw Error(await response.text());
      }
    } catch (error) {
      setItems(items);
    }
  };

  const handleTogglePower = async (deviceId, currentValue) => {
    const updatedItems = items.map(item => {
      if (item.id === deviceId) {
        return { ...item, attributes: { ...item.attributes, power: !currentValue } };
      }
      return item;
    });
    setItems(updatedItems);

    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems.find(item => item.id === deviceId))
      });
      if (!response.ok) {
        throw Error(await response.text());
      }
      setToastMessage( !currentValue == true ? 'Se ha activado la notificación de encendido.' : 'Se ha desactivado la notificación de encendido');
      setToastSeverity('success');
      setOpenToast(true);
    } catch (error) {
      setItems(items);
      setToastMessage('Error al actualizar el estado de encendido');
      setToastSeverity('error');
      setOpenToast(true);
    }
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize='small' />,
    handler: (deviceId) => navigate(`/settings/device/${deviceId}/connections`),
  };

  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');

  const handleUpdateSpeedometer = async (deviceId, newValue) => {
    if (isNaN(newValue) || newValue < 0) {
      setToastMessage('Por favor ingrese un valor válido');
      setToastSeverity('error');
      setOpenToast(true);
      return;
    }

    const updatedItems = items.map(item => {
      if (item.id === deviceId) {
        return { ...item, attributes: { ...item.attributes, speedometer: Number(newValue) } };
      }
      return item;
    });
    setItems(updatedItems);

    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems.find(item => item.id === deviceId))
      });
      if (!response.ok) {
        throw Error(await response.text());
      }
      setToastMessage('Velocímetro actualizado correctamente');
      setToastSeverity('success');
      setOpenToast(true);
    } catch (error) {
      setItems(items);
      setToastMessage('Error al actualizar el velocímetro');
      setToastSeverity('error');
      setOpenToast(true);
    }
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenToast(false);
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'deviceTitle']}
    >
      <Grid container spacing={8} className={classes.header}>
        <Grid item xs={4}>
          <Paper elevation={3} className={classes.item}>
            Total: {items.length}
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper elevation={3} className={classes.item}>
            Online: {items.filter((item) => item.status === 'online').length}
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper elevation={3} className={classes.item}>
            Offline:{' '}
            <span>
              {items.filter((item) => item.status !== 'online').length}
            </span>
          </Paper>
        </Grid>
      </Grid>

      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>{t('deviceIdentifier')}</TableCell>
            <TableCell>Termo</TableCell>
            <TableCell>Tel/ICC</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Velocimetro</TableCell>
            <TableCell>Encendido</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            items.filter(filterByKeyword(searchKeyword)).map((item) => {
              const speedometerValue = item.attributes?.speedometer || '';
              const powerValue = item.attributes?.power || false;
              return (
                <TableRow key={item.id}>
                  <TableCell>{formatTime(item.createdAt, 'date', hours12)}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.uniqueId}</TableCell>
                  <TableCell>
                    {item.attributes ? item.attributes.termo : ''}
                  </TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>{item.contact}</TableCell>
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      value={item.attributes?.speedometer || ''}
                      onChange={(e) => {
                        const updatedItems = items.map(device => {
                          if (device.id === item.id) {
                            return { ...device, attributes: { ...device.attributes, speedometer: e.target.value ? Number(e.target.value) : 0 } };
                          }
                          return device;
                        });
                        setItems(updatedItems);
                      }}
                      onBlur={(e) => handleUpdateSpeedometer(item.id, e.target.value)}
                      disabled={deviceReadonly}
                      InputProps={{
                        endAdornment: <span style={{ marginLeft: 8 }}>km/h</span>,
                      }}
                      inputProps={{
                        min: 0,
                        style: { textAlign: 'right' }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color={powerValue ? "primary" : "inherit"}
                      onClick={() => handleTogglePower(item.id, powerValue)}
                      disabled={deviceReadonly}
                    >
                      {powerValue ? "ON" : "OFF"}
                    </Button>
                  </TableCell>
                  <TableCell className={classes.columnAction} padding='none'>
                    <CollectionActions
                      itemId={item.id}
                      editPath='/settings/device'
                      endpoint='devices'
                      setTimestamp={setTimestamp}
                      customActions={[actionConnections]}
                      readonly={deviceReadonly}
                      phoneNumber={item.phone}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableShimmer columns={9} endAction />
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>
              <Button onClick={handleExport} variant="text">{t('reportExport')}</Button>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <CollectionFab editPath='/settings/device' />
      <Snackbar open={openToast} autoHideDuration={6000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal:'right' }}>
        <Alert onClose={handleCloseToast} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default DevicesPage;