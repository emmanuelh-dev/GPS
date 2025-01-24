const speedConverter = (unit) => {
  switch (unit) {
    case "kmh":
      return 1.852;
    case "mph":
      return 1.15078;
    case "kn":
    default:
      return 1;
  }
};

export const speedUnitString = (unit, t) => {
  switch (unit) {
    case "kmh":
      return t("sharedKmh");
    case "mph":
      return t("sharedMph");
    case "kn":
    default:
      return t("sharedKn");
  }
};

export const speedFromKnots = (value, unit) => value * speedConverter(unit);

export const speedToKnots = (value, unit) =>{ 

  value / speedConverter(unit)};

const distanceConverter = (unit) => {
  switch (unit) {
    case "mi":
      return 0.000621371;
    case "nmi":
      return 0.000539957;
    case "km":
    default:
      return 0.001;
  }
};

export const distanceUnitString = (unit, t) => {
  switch (unit) {
    case "mi":
      return t("sharedMi");
    case "nmi":
      return t("sharedNmi");
    case "km":
    default:
      return t("sharedKm");
  }
};

export const distanceFromMeters = (value, unit) =>
  value * distanceConverter(unit);

export const distanceToMeters = (value, unit) =>
  value / distanceConverter(unit);

const altitudeConverter = (unit) => {
  switch (unit) {
    case "ft":
      return 3.28084;
    case "m":
    default:
      return 1;
  }
};

export const altitudeUnitString = (unit, t) => {
  switch (unit) {
    case "ft":
      return t("sharedFeet");
    case "m":
    default:
      return t("sharedMeters");
  }
};

export const altitudeFromMeters = (value, unit) =>
  value * altitudeConverter(unit);

export const altitudeToMeters = (value, unit) =>
  value / altitudeConverter(unit);

const volumeConverter = (unit) => {
  switch (unit) {
    case "impGal":
      return 4.546;
    case "usGal":
      return 3.785;
    case "ltr":
    default:
      return 1;
  }
};

export const volumeUnitString = (unit, t) => {
  switch (unit) {
    case "impGal":
      return t("sharedGallonAbbreviation");
    case "usGal":
      return t("sharedGallonAbbreviation");
    case "ltr":
    default:
      return t("sharedLiterAbbreviation");
  }
};

const formatAlertMessage = (alert, device) => {
  const deviceName = device?.name || alert.deviceId;
  const time = dayjs(alert.alertTime).format('DD/MM/YYYY HH:mm:ss');

  switch (alert.type) {
    case 'geofenceEnter':
      return `${deviceName} ha entrado en la geocerca ${alert.attributes.body?.split(' ')[3] || ''} el ${time}`;
    case 'geofenceExit':
      return `${deviceName} ha salido de la geocerca ${alert.attributes.body?.split(' ')[3] || ''} el ${time}`;
    case 'deviceOnline':
      return `${deviceName} se ha conectado el ${time}`;
    case 'deviceOffline':
      return `${deviceName} se ha desconectado el ${time}`;
    case 'deviceStopped':
      return `${deviceName} se ha detenido el ${time}`;
    case 'deviceMoving':
      return `${deviceName} está en movimiento desde ${time}`;
    case 'deviceFuelDrop':
      return `Caída de combustible detectada en ${deviceName} el ${time}`;
    case 'deviceOverspeed':
      return `${deviceName} ha excedido el límite de velocidad el ${time}`;
    default:
      return alert.attributes.body || `Alerta de ${deviceName} el ${time}`;
  }
};


export const volumeFromLiters = (value, unit) => value / volumeConverter(unit);

export const volumeToLiters = (value, unit) => value * volumeConverter(unit);
