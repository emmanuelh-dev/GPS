import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button
} from "@mui/material";
import ReportFilter from "./components/ReportFilter";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import { useCatch } from "../reactHelper";
import MapView from "../map/core/MapView";
import MapRoutePath from "../map/MapRoutePath";
import useReportStyles from "./common/useReportStyles";
import TableShimmer from "../common/components/TableShimmer";
import MapCamera from "../map/MapCamera";
import MapGeofence from "../map/MapGeofence";
import { formatTime } from "../common/util/formatter";
import { usePreference } from "../common/util/preferences";
import { prefixString } from "../common/util/stringUtils";
import MapMarkers from "../map/MapMarkers";
import * as XLSX from "xlsx";

const CombinedReportPage = () => {
  const classes = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);

  const hours12 = usePreference("twelveHourFormat");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const createMarkers = () =>
    items.flatMap((item) =>
      item.events
        .map((event) => item.positions.find((p) => event.positionId === p.id))
        .filter((position) => position != null)
        .map((position) => ({
          latitude: position.latitude,
          longitude: position.longitude,
        })),
    );

  const handleSubmit = useCatch(async ({ deviceIds, groupIds, from, to }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append("deviceId", deviceId));
    groupIds.forEach((groupId) => query.append("groupId", groupId));
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/combined?${query.toString()}`);
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  });

  const handleDownload = () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = items.map((item) => {
      return item.events.map((event) => ({
        Device: devices[item.deviceId].name,
        Time: formatTime(event.eventTime, "seconds", hours12),
        Type: t(prefixString("event", event.type)),
        Duration: event.duration,
        Location: event.location,
      }));
    }).flat();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Combined Report");
    XLSX.writeFile(workbook, "CombinedReport.xlsx");
  };

  return (
    <PageLayout
      menu={<ReportsMenu />}
      breadcrumbs={["reportTitle", "reportCombined"]}
    >
      <div className={classes.container}>
        {Boolean(items.length) && (
          <div className={classes.containerMap}>
            <MapView>
              <MapGeofence />
              {items.map((item) => (
                <MapRoutePath
                  key={item.deviceId}
                  name={devices[item.deviceId].name}
                  coordinates={item.route}
                />
              ))}
              <MapMarkers markers={createMarkers()} />
            </MapView>
            <MapCamera coordinates={items.flatMap((item) => item.route)} />
          </div>
        )}
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter
              handleSubmit={handleSubmit}
              showOnly
              multiDevice
              includeGroups
            />
            {items.length > 0 &&
              <Button onClick={handleDownload} variant="contained" color="primary">
                Descargar Excel
              </Button>
            }
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("sharedDevice")}</TableCell>
                <TableCell>{t("positionFixTime")}</TableCell>
                <TableCell>{t("sharedType")}</TableCell>
                <TableCell>{t("eventDuration")}</TableCell>
                <TableCell>{t("eventLocation")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? (
                items.flatMap((item) =>
                  item.events.map((event, index) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        {index ? "" : devices[item.deviceId].name}
                      </TableCell>
                      <TableCell>
                        {formatTime(event.eventTime, "seconds", hours12)}
                      </TableCell>
                      <TableCell>
                        {t(prefixString("event", event.type))}
                      </TableCell>
                      <TableCell>
                        {event.duration}
                      </TableCell>
                      <TableCell>
                        {event.location}
                      </TableCell>
                    </TableRow>
                  )),
                )
              ) : (
                <TableShimmer columns={3} />
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
};

export default CombinedReportPage;
