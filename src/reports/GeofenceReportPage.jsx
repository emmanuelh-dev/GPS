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
    async ({ geofenceId, geofenceIds, from, to, type }) => {
      const query = new URLSearchParams({ from, to });
      geofenceIds.forEach((geofenceId) =>
        query.append("geofenceId", geofenceId)
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

    geofenceIds.forEach((geofenceId, index) => {
      if (index > 0) {
        doc.addPage();
      }

      doc.setFontSize(16);
      doc.text(geofences[geofenceId].name, 14, 15);

      const tableData = items
        .filter((it) => it.geofenceId == geofenceId)
        .map((item) => [
          devices[item.deviceId].name,
          formatTime(item.enterTime),
          formatTime(item.exitTime),
          item.exitTime !== null
            ? formatNumericSeconds(item.duration, t)
            : formatNumericSeconds(
                dayjs().diff(dayjs(formatTime(item.enterTime)), "second"),
                t
              ),
        ]);

      doc.autoTable({
        startY: 25,
        head: [
          [t("sharedDevice"), "Enter Time", "Exit Time", t("reportDuration")],
        ],
        body: tableData,
      });
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
              loading={loading}
            />

            {!!items.length &&
              !loading &&
              geofences &&
              geofenceIds.map((geofenceId) => (
                <>
                  <Typography ml={2} mt={2} variant={"h6"}>
                    {geofences[geofenceId].name}
                  </Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("sharedDevice")}</TableCell>
                        <TableCell>{"Enter Time"}</TableCell>
                        <TableCell>{"Exit Time"}</TableCell>
                        <TableCell>{t("reportDuration")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!loading &&
                        !items.filter((it) => it.geofenceId == geofenceId)
                          .length && (
                          <TableRow key={geofenceId}>
                            <TableCell colSpan={2}>
                              {t("sharedNoData")}
                            </TableCell>
                          </TableRow>
                        )}
                      {!loading &&
                        items
                          .filter((it) => it.geofenceId == geofenceId)
                          .map((item) => (
                            <TableRow key={item.id}>
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
                </>
              ))}
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
