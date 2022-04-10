import { Logger, PlatformAccessory } from 'homebridge';

import { BrowanAmbientLightSensorAccessory } from './Accessories';
import { HeliumAccessoryContext } from './types';
import { HeliumIOTPlatform } from './platform';

export enum DeviceType {
  BROWAN_AMBIENT_LIGHT_SENSOR = 'BROWAN_AMBIENT_LIGHT_SENSOR',
}

export function createDevice(
  type: DeviceType,
  platform: HeliumIOTPlatform,
  accessory: PlatformAccessory<HeliumAccessoryContext>,
  log: Logger,
) {
  log.info(`Creating device for type: ${type.toString()}`);

  switch (type) {
    case DeviceType.BROWAN_AMBIENT_LIGHT_SENSOR:
      new BrowanAmbientLightSensorAccessory(platform, accessory);
      break;

    default:
      log.info('Device type not found');
  }
}
