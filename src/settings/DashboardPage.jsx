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
} from '@mui/material';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import useSettingsStyles from './common/useSettingsStyles';
import { LineChart } from '@mui/x-charts/LineChart';

const DashboardPage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();

  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/server/devices');
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
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
  const devices = groupDevicesByMonth(items);

  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'dashboard']}
    >
      <Box>
        {!loading && (
          <LineChart
            xAxis={[{ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }]}
            series={[
              {
                data: devices,
                label: 'GPS',
              },
            ]}
            // width={500}
            height={400}
            grid={{ vertical: true, horizontal: true }}
          />
        )}
      </Box>
    </PageLayout>
  );
};

export default DashboardPage;
