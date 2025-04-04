import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import { useCatch } from "../reactHelper";
import useReportStyles from "./common/useReportStyles";
import TableShimmerGeofenceReport from "../common/components/TableShimmerGeofenceReport";
import {
  formatNumericSeconds,
  formatTime,
} from "../common/util/formatter";
import SettingsMenu from "../settings/components/SettingsMenu";

const DeviceGeofenceReportPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const classes = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);
  const geofences = useSelector((state) => state.geofences.items);
  
  const deviceId = parseInt(params.deviceId, 10);
  const device = devices[deviceId];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para cargar automáticamente los datos de las últimas 24 horas
  const loadDeviceGeofenceData = useCatch(async () => {
    if (!deviceId) return;
    
    setLoading(true);
    try {
      // Calcular fechas para las últimas 24 horas
      const to = dayjs().toISOString();
      const from = dayjs().subtract(24, 'hours').toISOString();
      
      const query = new URLSearchParams({ from, to });
      query.append("deviceId", deviceId);
      
      const response = await fetch(
        `/api/reports/geofences?${query.toString()}`,
        {
          headers: { Accept: "application/json" },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    loadDeviceGeofenceData();
  }, [deviceId]);

  const exportToPDF = () => {
    if (!items.length) return;
    
    const doc = new jsPDF();

    doc.setFontSize(16);

    doc.setFontSize(24);
    doc.setTextColor(0, 0, 255);
    doc.addImage('/1.png', 'PNG', 10, 10, 20, 20);
    doc.setTextColor(0, 0, 0);

    // Add title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(`Reporte de ${t("sharedGeofence")} - ${device?.name || 'Dispositivo'}`, 35, 20);

    // Add subtitle
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Dispositivo: ${device?.name || 'Desconocido'}`, 10, 40, { align: 'left' });
    doc.text(`Fecha de inicio: ${formatTime(items[0]?.enterTime || new Date(), 'date')}`, 10, 52, { align: 'left' });
    doc.text(`Fecha de fin: ${formatTime(new Date(), 'date')}`, 10, 58, { align: 'left' });

    const tableData = items.map((item) => [
      geofences[item.geofenceId]?.name || 'Desconocida',
      formatTime(item.enterTime),
      formatTime(item.exitTime),
      item.exitTime !== null
        ? formatNumericSeconds(item.duration, t)
        : formatNumericSeconds(dayjs().diff(dayjs(formatTime(item.enterTime)), "second"), t),
    ]);

    doc.autoTable({
      startY: 65,
      head: [
        [t("sharedGeofence"), "Hora de entrada", "Hora de salida", t("reportDuration")],
      ],
      body: tableData,
    });
    doc.save(`geofence_report_${device?.name || 'device'}_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.pdf`);
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["reportTitle", "sharedGeofence", device?.name || 'Dispositivo']}
    >
      <div className={classes.container}>
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <Paper className={classes.titleContainer}>
              <Typography variant="h6" className={classes.title}>
                Últimas 24 horas en geozonas - {device?.name || 'Dispositivo'}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => loadDeviceGeofenceData()}
                disabled={loading}
              >
                Actualizar
              </Button>
            </Paper>
            
            {items && <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("sharedGeofence")}</TableCell>
                  <TableCell>{"Hora de entrada"}</TableCell>
                  <TableCell>{"Hora de salida"}</TableCell>
                  <TableCell>{t("reportDuration")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && !items.length && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      {t("sharedNoData")}
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {geofences[item.geofenceId]?.name || 'Desconocida'}
                      </TableCell>
                      <TableCell>
                        {formatTime(item.enterTime)}
                      </TableCell>
                      <TableCell>{formatTime(item.exitTime)}</TableCell>
                      <TableCell>
                        {item.exitTime !== null
                          ? formatNumericSeconds(item.duration, t)
                          : formatNumericSeconds(
                            dayjs().diff(
                              dayjs(formatTime(item.enterTime)),
                              "second"
                            ),
                            t
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>}
            {loading && <TableShimmerGeofenceReport columns={2} />}
            <Button 
              onClick={exportToPDF} 
              disabled={loading || !items.length}
              variant="contained"
              color="primary"
              style={{ marginTop: 16 }}
            >
              Exportar a PDF
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DeviceGeofenceReportPage;