// Vehicle-specific alarms that should be filtered out for person tracking focus
export const VEHICLE_SPECIFIC_ALARMS = [
  'alarmAccident',
  'alarmTow', 
  'alarmIdle',
  'alarmHighRpm',
  'alarmHardAcceleration',
  'alarmHardBraking',
  'alarmHardCornering',
  'alarmLaneChange',
  'alarmFatigueDriving',
  'alarmParking',
  'alarmBonnet',
  'alarmFootBrake',
  'alarmFuelLeak'
];

// Vehicle-specific alarm keys without 'alarm' prefix (for formatter)
export const VEHICLE_SPECIFIC_ALARM_KEYS = [
  'accident',
  'tow',
  'idle', 
  'highRpm',
  'hardAcceleration',
  'hardBraking',
  'hardCornering',
  'laneChange',
  'fatigueDriving',
  'parking',
  'bonnet',
  'footBrake',
  'fuelLeak'
];