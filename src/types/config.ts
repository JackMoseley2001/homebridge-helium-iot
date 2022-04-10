import { DeviceType } from '../DeviceType';

export type DeviceConfig = {
  type: DeviceType;
  name: string;
  deviceId: string;
  port: number;
  manufacturer: string;
  serialNumber: string;
  model: string;
  refreshDuration: number;
};

export type PluginConfig = {
  apiKey: string;
  devices: DeviceConfig[];
};
