import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

import {
  altitudeFromMeters,
  altitudeUnitString,
  distanceFromMeters,
  distanceUnitString,
  speedFromKnots,
  speedUnitString,
  volumeFromLiters,
  volumeUnitString,
} from "./converter";
import { prefixString } from "./stringUtils";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export const formatBoolean = (value, t) =>
  value ? t("sharedYes") : t("sharedNo");

export const formatNumber = (value, precision = 1) =>
  Number(value.toFixed(precision));

export const formatPercentage = (value) => `${value}%`;

export const formatTemperature = (value) => `${value}°C`;

export const formatVoltage = (value, t) =>
  `${value} ${t("sharedVoltAbbreviation")}`;

export const formatConsumption = (value, t) =>
  `${value} ${t("sharedLiterPerHourAbbreviation")}`;

export const formatTime = (value, format, hours12) => {
  if (value) {
    const d = dayjs(value);
    switch (format) {
      case "date":
        return d.format("YYYY-MM-DD");
      case "time":
        return d.format(hours12 ? "hh:mm:ss A" : "HH:mm:ss");
      case "minutes":
        return d.format(hours12 ? "YYYY-MM-DD hh:mm A" : "YYYY-MM-DD HH:mm");
      default:
        return d.format(
          hours12 ? "YYYY-MM-DD hh:mm:ss A" : "YYYY-MM-DD HH:mm:ss"
        );
    }
  }
  return "";
};

export const formatStatus = (value, t) =>
  t(prefixString("deviceStatus", value));
export const formatAlarm = (value, t) =>
  value ? t(prefixString("alarm", value)) : "";

export const formatCourse = (value) => {
  const courseValues = [
    "\u2191",
    "\u2197",
    "\u2192",
    "\u2198",
    "\u2193",
    "\u2199",
    "\u2190",
    "\u2196",
  ];
  let normalizedValue = (value + 45 / 2) % 360;
  if (normalizedValue < 0) {
    normalizedValue += 360;
  }
  return courseValues[Math.floor(normalizedValue / 45)];
};

export const formatDistance = (value, unit, t) => {
  const formattedDistance = distanceFromMeters(value, unit).toFixed(2);
  const numberWithCommas = parseFloat(formattedDistance).toLocaleString();
  return `${numberWithCommas} ${distanceUnitString(unit, t)}`;
};

export const formatAltitude = (value, unit, t) =>
  `${altitudeFromMeters(value, unit).toFixed(2)} ${altitudeUnitString(
    unit,
    t
  )}`;

export const formatSpeed = (value, unit, t) =>
  `${speedFromKnots(value, unit).toFixed(2)} ${speedUnitString(unit, t)}`;

export const formatVolume = (value, unit, t) =>
  `${volumeFromLiters(value, unit).toFixed(2)} ${volumeUnitString(unit, t)}`;

export const formatHours = (value) => dayjs.duration(value).humanize();

export const formatNumericHours = (value, t) => {
  const hours = Math.floor(value / 3600000);
  const minutes = Math.floor((value % 3600000) / 60000);
  return `${hours} ${t("sharedHourAbbreviation")} ${minutes} ${t(
    "sharedMinuteAbbreviation"
  )}`;
};

export const formatNumericSeconds = (value, t) => {
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours} ${t("sharedHourAbbreviation")}`);
  if (minutes > 0) parts.push(`${minutes} ${t("sharedMinuteAbbreviation")}`);
  if (seconds > 0 || parts.length === 0)
    parts.push(`${seconds} ${t("sharedSecondAbbreviation")}`); // Always show seconds if all are 0.

  return parts.join(" ");
};

export const formatCoordinate = (key, value, unit) => {
  let hemisphere;
  let degrees;
  let minutes;
  let seconds;

  if (key === "latitude") {
    hemisphere = value >= 0 ? "N" : "S";
  } else {
    hemisphere = value >= 0 ? "E" : "W";
  }

  switch (unit) {
    case "ddm":
      value = Math.abs(value);
      degrees = Math.floor(value);
      minutes = (value - degrees) * 60;
      return `${degrees}° ${minutes.toFixed(6)}' ${hemisphere}`;
    case "dms":
      value = Math.abs(value);
      degrees = Math.floor(value);
      minutes = Math.floor((value - degrees) * 60);
      seconds = Math.round((value - degrees - minutes / 60) * 3600);
      return `${degrees}° ${minutes}' ${seconds}" ${hemisphere}`;
    default:
      return `${value.toFixed(6)}°`;
  }
};

export const getStatusColor = ({
  status,
  speed = 0,
  termo = false,
  ignition = false,
}) => {
  if (status === "online") {
    if (speed > 0) {
      return "success";
    }

    return ignition ? "warning" : "error";
  }
  return "error";
};

export const voltageToPercentage = (voltage) => {
  const minVoltage = 3.3;
  const maxVoltage = 4;

  if (voltage >= maxVoltage) return 100;
  if (voltage <= minVoltage) return 0;

  return Math.round(((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100);
};

export const getBatteryStatus = (batteryLevel) => {
  if (batteryLevel >= 70) {
    return "success";
  }
  if (batteryLevel > 30) {
    return "warning";
  }
  return "error";
};

export const formatNotificationTitle = (t, notification, includeId) => {
  let title = t(prefixString("event", notification.type));
  if (notification.type === "alarm") {
    const alarmString = notification.attributes.alarms;
    if (alarmString) {
      const alarms = alarmString.split(",");
      if (alarms.length > 1) {
        title += ` (${alarms.length})`;
      } else {
        title += ` ${formatAlarm(alarms[0], t)}`;
      }
    }
  }
  if (includeId) {
    title += ` [${notification.id}]`;
  }
  return title;
};

export const formatAlertMessage = (alert, device) => {
  const deviceName = device?.name || alert.deviceId;
  const time = dayjs(alert.alertTime).format("DD/MM/YYYY HH:mm:ss");

  let geofenceName = "";
  if (alert.attributes.body) {
    const patterns = [
      /geofence\s+([^"\s]+(?:\s+[^"\s]+)*)\s+at/, // Matches "geofence Name Here at"
      /geofence\s+"([^"]+)"/, // Matches 'geofence "Name Here"'
      /geofence\s+([^:]+)(?:\s+at|\s*$)/, // Matches "geofence Name Here" with optional "at" or end of string
    ];

    for (const pattern of patterns) {
      const matches = alert.attributes.body.match(pattern);
      if (matches && matches[1]) {
        geofenceName = matches[1].trim();
        break;
      }
    }
  }

  switch (alert.type) {
    case "geofenceEnter":
      return `Entró en la geozona "${geofenceName}"`;
    case "geofenceExit":
      return `Salió de la geozona "${geofenceName}"`;
    case "deviceOnline":
      return `Se ha conectado`;
    case "deviceOffline":
      return `Se ha desconectado`;
    case "deviceStopped":
      return `Se ha detenido`;
    case "deviceMoving":
      return `Está en movimiento`;
    case "deviceFuelDrop":
      return `Caída de combustible detectada en ${deviceName}`;
    case "deviceOverspeed":
      return `${deviceName} ha excedido el límite de velocidad`;
    default:
      return alert.attributes.body || `Alerta de ${deviceName}`;
  }
};
