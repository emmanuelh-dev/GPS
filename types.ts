export interface Attributes {
    distance: number;
    totalDistance: number;
    motion: boolean;
}


export interface OptionalAttributes {
    priority?: number;
    sat?: number;
    event?: number;
    ignition?: boolean;
    rssi?: number;
    io200?: number;
    io69?: number;
    io29?: number;
    io20?: number;
    io22?: number;
    io23?: number;
    io113?: number;
    pdop?: number;
    hdop?: number;
    power?: number;
    battery?: number;
    io68?: number;
    bleTemp1?: number;
    bleTemp2?: number;
    bleTemp3?: number;
    bleTemp4?: number;
    io86?: number;
    io104?: number;
    io106?: number;
    io108?: number;
    operator?: number;
    tripOdometer?: number;
    odometer?: number;
    hours?: number;
}

export interface Attributes extends OptionalAttributes {
    distance: number;
    totalDistance: number;
    motion: boolean;
}

export interface Position {
    id: number;
    attributes: Attributes;
    deviceId: number;
    protocol: string;
    serverTime: string;
    deviceTime: string;
    fixTime: string;
    outdated: boolean;
    valid: boolean;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    course: number;
    address: string | null;
    accuracy: number;
    network: string | null;
    geofenceIds: any | null;
}


export interface Device{
    id: number;
    name: string;
    attributes: Attributes;
    phone: string;
    email: string;
    category: string;
    protocol: string;
    calendarId: number;
    createdAt: string;
    postitionId: number;
    status: string;
    uniqueId: string;
}
