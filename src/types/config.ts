export enum DeviceType {
  BROWAN_AMBIENT_LIGHT_SENSOR = 'BROWAN_AMBIENT_LIGHT_SENSOR',
}

export type DeviceConfig = {
  type: DeviceType;
  name: string;
  deviceId: string;
  port: number;
  manufacturer: string;
  serialNumber: string;
  model: string;
};

export type PluginConfig = {
  apiKey: string;
  refreshTime: number;
  devices: DeviceConfig[];
};
