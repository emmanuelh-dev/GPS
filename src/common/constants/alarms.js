// Allowed alarms for person tracking devices (ankle GPS)
export const ALLOWED_ALARMS = [
  { key: "general", name: "General" },
  { key: "sos", name: "SOS" },
  { key: "vibration", name: "Vibración" },
  { key: "movement", name: "Movimiento" },
  { key: "fallDown", name: "Alarma de caída" },
  { key: "lowPower", name: "Energía baja" },
  { key: "lowBattery", name: "Batería Baja" },
  { key: "fault", name: "Alarma de fallo" },
  { key: "powerOff", name: "Apagado" },
  { key: "powerOn", name: "Encendido" },
  { key: "geofence", name: "Geo-Zona" },
  { key: "geofenceEnter", name: "El Dispositivo ha entrado a la Geo-Zona" },
  { key: "geofenceExit", name: "El Dispositivo ha salido de la Geo-Zona" },
  { key: "gpsAntennaCut", name: "Antena del GPS Cortada" },
  { key: "powerCut", name: "Energía desconectada" },
  { key: "powerRestored", name: "Energía restaurada" },
  { key: "jamming", name: "Interferencia" },
  { key: "temperature", name: "Temperatura" },
  { key: "tampering", name: "Manipulación" },
  { key: "removing", name: "Eliminando" }
];

// Allowed alarm keys for formatter (without 'alarm' prefix)
export const ALLOWED_ALARM_KEYS = ALLOWED_ALARMS.map(alarm => alarm.key);