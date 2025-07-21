import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Button,
  TextField,
  Snackbar,
  Alert,
  Checkbox,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
} from '@mui/material';
import SmsIcon from '@mui/icons-material/Sms';
import DeleteIcon from '@mui/icons-material/Delete';
import makeStyles from '@mui/styles/makeStyles';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader from './components/SearchHeader';
import { usePreference } from '../common/util/preferences';
import { formatTime } from '../common/util/formatter';
import { useManager } from '../common/util/permissions';
import useSettingsStyles from './common/useSettingsStyles';

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
  filterContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusChip: {
    fontWeight: 'bold',
    color: 'white',
  },
  redStatus: {
    backgroundColor: '#f44336',
  },
  yellowStatus: {
    backgroundColor: '#ff9800',
  },
  greenStatus: {
    backgroundColor: '#4caf50',
  },
  grayStatus: {
    backgroundColor: '#9e9e9e',
  },
  ...useSettingsStyles,
}));

const ManagerDevicesPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();
  const manager = useManager();
  const hours12 = usePreference('twelveHourFormat');

  // Redirect if not manager
  if (!manager) {
    navigate('/settings/devices');
    return null;
  }

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [positions, setPositions] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState([]);

  // Filter states
  const [clientFilter, setClientFilter] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [devicesToDelete, setDevicesToDelete] = useState([]);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const [devicesResponse, positionsResponse] = await Promise.all([
        fetch('/api/devices'),
        fetch('/api/positions')
      ]);

      if (devicesResponse.ok && positionsResponse.ok) {
        const devicesData = await devicesResponse.json();
        const positionsData = await positionsResponse.json();
        setItems(devicesData);
        setPositions(positionsData);
      } else {
        throw Error('Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const getLastReportTime = (deviceId) => {
    const devicePositions = positions.filter(pos => pos.deviceId === deviceId);
    if (devicePositions.length === 0) return null;

    const lastPosition = devicePositions.reduce((latest, current) => {
      return new Date(current.fixTime) > new Date(latest.fixTime) ? current : latest;
    });

    return new Date(lastPosition.fixTime);
  };

  const getRiskLevel = (lastReportTime) => {
    if (!lastReportTime) return 'no-report';

    const now = new Date();
    const diffHours = (now - lastReportTime) / (1000 * 60 * 60);

    if (diffHours > 72) return 'red'; // More than 3 days
    if (diffHours > 24) return 'yellow'; // More than 24 hours
    return 'green'; // Less than 24 hours
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'red': return classes.redStatus;
      case 'yellow': return classes.yellowStatus;
      case 'green': return classes.greenStatus;
      default: return classes.grayStatus;
    }
  };

  const getRiskLevelText = (riskLevel) => {
    switch (riskLevel) {
      case 'red': return 'Crítico (>3 días)';
      case 'yellow': return 'Alerta (>24h)';
      case 'green': return 'Normal (<24h)';
      default: return 'Sin reportes';
    }
  };

  const getDeviceStatus = (device, lastReportTime) => {
    if (!lastReportTime) return 'sin-reportes';
    if (device.status === 'online') return 'activo';
    return 'inactivo';
  };

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item => {
      // Search keyword filter
      if (searchKeyword && !JSON.stringify(item).toLowerCase().includes(searchKeyword.toLowerCase())) {
        return false;
      }

      // Client filter
      if (clientFilter && item.contact !== clientFilter) {
        return false;
      }

      const lastReportTime = getLastReportTime(item.id);
      const riskLevel = getRiskLevel(lastReportTime);
      const deviceStatus = getDeviceStatus(item, lastReportTime);

      // Risk level filter
      if (riskLevelFilter && riskLevel !== riskLevelFilter) {
        return false;
      }

      // Status filter
      if (statusFilter && deviceStatus !== statusFilter) {
        return false;
      }

      // Date range filter
      if (dateFromFilter && lastReportTime) {
        const fromDate = new Date(dateFromFilter);
        if (lastReportTime < fromDate) return false;
      }

      if (dateToFilter && lastReportTime) {
        const toDate = new Date(dateToFilter);
        toDate.setHours(23, 59, 59, 999);
        if (lastReportTime > toDate) return false;
      }

      return true;
    });

    // Sort by last report time (oldest to newest)
    return filtered.sort((a, b) => {
      const timeA = getLastReportTime(a.id);
      const timeB = getLastReportTime(b.id);

      // Devices without reports go to the end
      if (!timeA && !timeB) return 0;
      if (!timeA) return 1;
      if (!timeB) return -1;

      return timeA - timeB;
    });
  }, [items, positions, searchKeyword, clientFilter, riskLevelFilter, statusFilter, dateFromFilter, dateToFilter]);

  const uniqueClients = useMemo(() => {
    return [...new Set(items.map(item => item.contact).filter(Boolean))];
  }, [items]);

  const handleSelectDevice = (deviceId) => {
    setSelectedDevices(prev => {
      if (prev.includes(deviceId)) {
        return prev.filter(id => id !== deviceId);
      } else {
        return [...prev, deviceId];
      }
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedDevices(filteredAndSortedItems.map(item => item.id));
    } else {
      setSelectedDevices([]);
    }
  };

  const handleOpenMassSmsDrawer = () => {
    dispatch({ type: 'devices/updateMassSmsDevices', payload: selectedDevices });
    dispatch({ type: 'devices/toggleMassSms' });
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenToast(false);
  };

  const handleDeleteDevices = () => {
    if (selectedDevices.length === 0) {
      setToastMessage('Selecciona al menos un dispositivo para eliminar');
      setToastSeverity('warning');
      setOpenToast(true);
      return;
    }
    setDevicesToDelete(selectedDevices);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDevices = async () => {
    try {
      const deletePromises = devicesToDelete.map(deviceId => 
        fetch(`/api/devices/${deviceId}`, {
          method: 'DELETE',
        })
      );

      const results = await Promise.all(deletePromises);
      const failedDeletes = results.filter(result => !result.ok);

      if (failedDeletes.length === 0) {
        setToastMessage(`${devicesToDelete.length} dispositivo(s) eliminado(s) exitosamente`);
        setToastSeverity('success');
        setSelectedDevices([]);
        setTimestamp(Date.now()); // Refresh data
      } else {
        setToastMessage(`Error al eliminar ${failedDeletes.length} dispositivo(s)`);
        setToastSeverity('error');
      }
    } catch (error) {
      setToastMessage('Error al eliminar dispositivos');
      setToastSeverity('error');
    } finally {
      setDeleteDialogOpen(false);
      setDevicesToDelete([]);
      setOpenToast(true);
    }
  };

  const cancelDeleteDevices = () => {
    setDeleteDialogOpen(false);
    setDevicesToDelete([]);
  };

  const clearFilters = () => {
    setClientFilter('');
    setRiskLevelFilter('');
    setStatusFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setSearchKeyword('');
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'Monitoreo de Dispositivos']}
    >
      <Grid container spacing={8} className={classes.header}>
        <Grid item xs={3}>
          <Paper elevation={3} className={classes.item}>
            Total: {filteredAndSortedItems.length}
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper elevation={3} className={`${classes.item} ${classes.greenStatus}`} style={{ color: 'white' }}>
            Normal: {filteredAndSortedItems.filter(item => getRiskLevel(getLastReportTime(item.id)) === 'green').length}
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper elevation={3} className={`${classes.item} ${classes.yellowStatus}`} style={{ color: 'white' }}>
            Alerta: {filteredAndSortedItems.filter(item => getRiskLevel(getLastReportTime(item.id)) === 'yellow').length}
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper elevation={3} className={`${classes.item} ${classes.redStatus}`} style={{ color: 'white' }}>
            Crítico: {filteredAndSortedItems.filter(item => getRiskLevel(getLastReportTime(item.id)) === 'red').length}
          </Paper>
        </Grid>
      </Grid>

      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />

      <Box className={classes.filterContainer}>
        <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
          <InputLabel>Cliente</InputLabel>
          <Select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            label="Cliente"
          >
            <MenuItem value="">Todos</MenuItem>
            {uniqueClients.map(client => (
              <MenuItem key={client} value={client}>{client}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
          <InputLabel>Nivel de Riesgo</InputLabel>
          <Select
            value={riskLevelFilter}
            onChange={(e) => setRiskLevelFilter(e.target.value)}
            label="Nivel de Riesgo"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="green">Normal</MenuItem>
            <MenuItem value="yellow">Alerta</MenuItem>
            <MenuItem value="red">Crítico</MenuItem>
            <MenuItem value="no-report">Sin reportes</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Estado"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="activo">Activo</MenuItem>
            <MenuItem value="inactivo">Inactivo</MenuItem>
            <MenuItem value="sin-reportes">Sin reportes</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Desde"
          type="date"
          size="small"
          value={dateFromFilter}
          onChange={(e) => setDateFromFilter(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Hasta"
          type="date"
          size="small"
          value={dateToFilter}
          onChange={(e) => setDateToFilter(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <Button variant="outlined" onClick={clearFilters}>
          Limpiar Filtros
        </Button>

        {selectedDevices.length > 0 && (
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={handleDeleteDevices}
          >
            Eliminar ({selectedDevices.length})
          </Button>
        )}
      </Box>

      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={selectedDevices.length > 0 && selectedDevices.length < filteredAndSortedItems.length}
                checked={selectedDevices.length > 0 && selectedDevices.length === filteredAndSortedItems.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Días Inactivo</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Identificador</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Último Reporte</TableCell>
            <TableCell>Tiempo Sin Reportar</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            filteredAndSortedItems.map((item) => {
              const lastReportTime = getLastReportTime(item.id);
              const riskLevel = getRiskLevel(lastReportTime);
              const deviceStatus = getDeviceStatus(item, lastReportTime);

              const getTimeSinceReport = () => {
                if (!lastReportTime) return 'Nunca';

                const now = new Date();
                const diffMs = now - lastReportTime;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffDays = Math.floor(diffHours / 24);

                if (diffDays > 0) {
                  return `${diffDays} día${diffDays > 1 ? 's' : ''} ${diffHours % 24}h`;
                }
                return `${diffHours}h ${Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))}m`;
              };

              const getDaysInactive = () => {
                if (!lastReportTime) return 'N/A';

                const now = new Date();
                const diffMs = now - lastReportTime;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                if (diffDays === 0) {
                  return 'Activo hoy';
                }

                return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
              };

              return (
                <TableRow key={item.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedDevices.includes(item.id)}
                      onChange={() => handleSelectDevice(item.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getRiskLevelText(riskLevel)}
                      className={`${classes.statusChip} ${getRiskLevelColor(riskLevel)}`}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <strong style={{
                      color: !lastReportTime ? '#9e9e9e' :
                        Math.floor((new Date() - lastReportTime) / (1000 * 60 * 60 * 24)) === 0 ? '#4caf50' :
                          Math.floor((new Date() - lastReportTime) / (1000 * 60 * 60 * 24)) <= 3 ? '#ff9800' : '#f44336'
                    }}>
                      {getDaysInactive()}
                    </strong>
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.uniqueId}</TableCell>
                  <TableCell>{item.contact || 'Sin asignar'}</TableCell>
                  <TableCell>
                    {lastReportTime ? formatTime(lastReportTime.toISOString(), 'dateTime', hours12) : 'Nunca'}
                  </TableCell>
                  <TableCell>{getTimeSinceReport()}</TableCell>

                  <TableCell>{item.phone || 'N/A'}</TableCell>
                  <TableCell>{item.category || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => {
                        setDevicesToDelete([item.id]);
                        setDeleteDialogOpen(true);
                      }}
                      title="Eliminar dispositivo"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableShimmer columns={11} endAction />
          )}
        </TableBody>
      </Table>

      {selectedDevices.length > 0 && (
        <Fab
          color="primary"
          style={{ position: 'fixed', bottom: '90px', right: '16px' }}
          onClick={handleOpenMassSmsDrawer}
        >
          <SmsIcon />
        </Fab>
      )}

      <Snackbar open={openToast} autoHideDuration={6000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseToast} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteDevices}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            ¿Estás seguro de que deseas eliminar {devicesToDelete.length} dispositivo(s)? 
            Esta acción no se puede deshacer y eliminará permanentemente los datos del dispositivo.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteDevices} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDeleteDevices} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default ManagerDevicesPage;