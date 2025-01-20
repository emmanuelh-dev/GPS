import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ReportFilterGeofence from "./components/ReportFilterGeofence";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import { useCatch } from "../reactHelper";
import useReportStyles from "./common/useReportStyles";
import TableShimmerGeofenceReport from "../common/components/TableShimmerGeofenceReport";
import scheduleReport from "./common/scheduleReport";
import {
  formatNumericHours,
  formatNumericSeconds,
  formatTime,
} from "../common/util/formatter";
import dayjs from "dayjs";
import SettingsMenu from "../settings/components/SettingsMenu";

const GeofenceReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);
  const geofences = useSelector((state) => state.geofences.items);

  const geofenceIds = useSelector((state) => state.geofences.selectedIds);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCatch(
    async ({ geofenceId, geofenceIds, deviceId, deviceIds, from, to, type }) => {
      const query = new URLSearchParams({ from, to });
      geofenceIds.forEach((geofenceId) =>
        query.append("geofenceId", geofenceId)
      );
      deviceIds.forEach((deviceId) =>
        query.append("deviceId", deviceId)
      );
      if (type === "export") {
        // window.location.assign(`/api/reports/geofences/xlsx?${query.toString()}`);
      } else if (type === "mail") {
        // const response = await fetch(`/api/reports/geofences/mail?${query.toString()}`);
        // if (!response.ok) {
        //   throw Error(await response.text());
        // }
      } else {
        setLoading(true);
        try {
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
      }
    }
  );

  const handleSchedule = useCatch(async (geofenceIds, groupIds, report) => {
    report.type = "route";
    const error = await scheduleReport(geofenceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate("/reports/scheduled");
    }
  });

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);

    doc.setFontSize(24);
    doc.setTextColor(0, 0, 255);
    doc.addImage('/1.png', 'PNG', 10, 10, 20, 20);
    doc.setTextColor(0, 0, 0);

    // Add title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(`Reporte ${t("sharedGeofence")}`, 35, 20);

    // Add subtitle
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Geozonas: ${geofenceIds.map((geofenceId) => geofences[geofenceId].name).join(', ')}`, 10, 40, { align: 'left' });
    doc.text(`Fecha de inicio: ${formatTime(items[0].fixTime, 'date')}`, 10, 52, { align: 'left' });
    doc.text(`Fecha de fin: ${formatTime(items[items.length - 1].fixTime, 'date')}`, 10, 58, { align: 'left' });

    const tableData = items.map((item) => [
      geofences[item.geofenceId].name,
      devices[item.deviceId].name,
      formatTime(item.enterTime),
      formatTime(item.exitTime),
      item.exitTime !== null
        ? formatNumericSeconds(item.duration, t)
        : formatNumericSeconds(dayjs().diff(dayjs(formatTime(item.enterTime)), "second"), t),
    ]);

    doc.autoTable({
      startY: 65,
      head: [
        [t("sharedGeofence"), t("sharedDevice"), "Hora de entrada", "Hora de salida", t("reportDuration")],
      ],
      body: tableData,
    });
    doc.save(`geofence_report_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.pdf`);
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["reportTitle", "sharedGeofence"]}
    >
      <div className={classes.container}>
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilterGeofence
              handleSubmit={handleSubmit}
              handleSchedule={handleSchedule}
              multi
              multiDevice
              loading={loading}
            />
            {
              items && <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("sharedGeofence")}</TableCell>
                    <TableCell>{t("sharedDevice")}</TableCell>
                    <TableCell>{"Hora de entrada"}</TableCell>
                    <TableCell>{"Hora de salida"}</TableCell>
                    <TableCell>{t("reportDuration")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loading &&
                    !items.length && (
                      <TableRow key={items.id}>
                        <TableCell colSpan={6}>
                          {t("sharedNoData")}
                        </TableCell>
                      </TableRow>
                    )}
                  {!loading &&
                    items
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {geofences[item.geofenceId].name}
                          </TableCell>
                          <TableCell>
                            {devices[item.deviceId].name}
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
              </Table>
            }
            {loading && <TableShimmerGeofenceReport columns={2} />}
            <Button onClick={exportToPDF} disabled={loading || !items.length}>
              Export to PDF
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default GeofenceReportPage;
