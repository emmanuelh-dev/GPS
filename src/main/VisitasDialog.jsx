import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import dayjs from "dayjs";
import { useTranslation } from "../common/components/LocalizationProvider";
import { formatNumericSeconds, formatTime } from "../common/util/formatter";
import TableShimmerGeofenceReport from "../common/components/TableShimmerGeofenceReport";
import { useVisitasDialog } from "../store/VisitasDialogContext";

const useStyles = makeStyles((theme) => ({
  details: {
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
}));

const VisitasDialog = () => {
  const { openVisitas, onCloseVisitas, device } = useVisitasDialog();
  const classes = useStyles();
  const t = useTranslation();
  const [items, setItems] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const previousDeviceRef = useRef(null);

  const fetchGeofences = useCallback(async () => {
    try {
      const response = await fetch("/api/geofences", {
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setGeofences(data);
        return data;
      }
    } catch (err) {
      setError(t("errorLoadingGeofences", "Error al cargar geozonas"));
      console.error(err);
      return [];
    }
  }, [t]);

  const loadDeviceGeofenceData = useCallback(async () => {
    if (!device) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const to = dayjs().toISOString();
      const from = dayjs().subtract(24, 'hours').toISOString();

      const query = new URLSearchParams({ from, to, deviceId: device });

      if (geofences.length > 0) {
        geofences.forEach((geofence) => {
          query.append("geofenceId", geofence.id);
        });
      }

      const response = await fetch(
        `/api/reports/geofences?${query.toString()}`,
        { headers: { Accept: "application/json" } }
      );

      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        throw new Error("Failed to fetch geofence data");
      }
    } catch (err) {
      setError(t("errorLoadingGeofenceHistory", "Error al cargar el historial de geozonas"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [device, geofences, t]);

  useEffect(() => {
    fetchGeofences();
  }, [fetchGeofences]);

  useEffect(() => {
    // Only fetch data if the device has actually changed
    if (device !== previousDeviceRef.current) {
      previousDeviceRef.current = device;
      loadDeviceGeofenceData();
    }
  }, [device, loadDeviceGeofenceData]);

  const handleRefresh = () => {
    if (!loading && device && geofences.length > 0) {
      loadDeviceGeofenceData();
    }
  };

  return (
    <Dialog
      open={openVisitas}
      onClose={onCloseVisitas}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>{t("geofenceHistory", "Historial de Geozonas")} {device?.name || t("device", "Dispositivo")}</DialogTitle>
      <DialogContent className={classes.details}>
        {error && <Typography color="error">{error}</Typography>}

        <div className={classes.tableContainer}>
          {loading ? (
            <TableShimmerGeofenceReport columns={4} />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("sharedGeofence")}</TableCell>
                  <TableCell>{t("entryTime", "Hora de entrada")}</TableCell>
                  <TableCell>{t("exitTime", "Hora de salida")}</TableCell>
                  <TableCell>{t("reportDuration")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length > 0 ? (
                  items.map((item, i) => {
                    const geofence = geofences.find(g => g.id === item.geofenceId);
                    return (
                      <TableRow key={i}>
                        <TableCell>
                          {geofence?.name || t("unknown", "Desconocida")}
                        </TableCell>
                        <TableCell>
                          {formatTime(item.enterTime)}
                        </TableCell>
                        <TableCell>{formatTime(item.exitTime)}</TableCell>
                        <TableCell>
                          {formatNumericSeconds(
                            item.exitTime
                              ? dayjs(item.exitTime).diff(dayjs(item.enterTime), "second")
                              : dayjs().diff(dayjs(item.enterTime), "second"),
                            t
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      {t("noData", "No hay datos disponibles")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRefresh} disabled={loading || !geofences.length || !device}>
          {loading ? <CircularProgress size={24} /> : t("refresh", "Actualizar")}
        </Button>
        <Button onClick={onCloseVisitas}>
          {t("close", "Cerrar")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisitasDialog;