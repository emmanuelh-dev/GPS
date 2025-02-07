import React, { useState } from 'react';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
  Paper,
  Box,
  Grid,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import useSettingsStyles from './common/useSettingsStyles';
import { LineChart } from '@mui/x-charts/LineChart';

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
  chart: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(2),
  },
  ...useSettingsStyles,
}));

const DashboardPage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const [devicesResponse, usersResponse] = await Promise.all([
        fetch('/api/devices'),
        fetch('/api/users')
      ]);
      
      if (devicesResponse.ok && usersResponse.ok) {
        const devicesData = await devicesResponse.json();
        const usersData = await usersResponse.json();
        setDevices(devicesData);
        setUsers(usersData.filter(u => !u.temporary));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  function groupDevicesByMonth(devices) {
    const groupedDevices = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    devices.forEach((device) => {
      const createdAt = new Date(device.createdAt);
      const month = createdAt.getMonth();
      groupedDevices[month]++;
    });
    return groupedDevices;
  }

  const monthlyDevices = groupDevicesByMonth(devices);

  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const offlineDevices = devices.filter(d => d.status !== 'online').length;

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'dashboard']}
    >
      <Grid container spacing={3} className={classes.header}>
        <Grid item xs={3}>
          <Paper elevation={3} className={classes.item}>
            <Typography variant="h6">Total Dispositivos</Typography>
            <Typography variant="h4">{devices.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper elevation={3} className={classes.item}>
            <Typography variant="h6">Dispositivos Online</Typography>
            <Typography variant="h4" style={{color: '#4caf50'}}>{onlineDevices}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper elevation={3} className={classes.item}>
            <Typography variant="h6">Dispositivos Offline</Typography>
            <Typography variant="h4" style={{color: '#f44336'}}>{offlineDevices}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper elevation={3} className={classes.item}>
            <Typography variant="h6">Total Operadores</Typography>
            <Typography variant="h4" style={{color: '#2196f3'}}>{users.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} className={classes.chart}>
        <Typography variant="h6" style={{padding: '16px'}}>
          Dispositivos Registrados por Mes
        </Typography>
        {!loading && (
          <LineChart
            xAxis={[{ 
              data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
              label: 'Mes'
            }]}
            series={[
              {
                data: monthlyDevices,
                label: 'Dispositivos',
                color: '#2196f3'
              },
            ]}
            height={400}
            grid={{ vertical: true, horizontal: true }}
          />
        )}
      </Paper>
    </PageLayout>
  );
};

export default DashboardPage;
