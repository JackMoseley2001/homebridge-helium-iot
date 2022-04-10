import { Logger, PlatformAccessory } from 'homebridge';

import { BrowanAmbientLightTBAM100Accessory } from './Accessories';
import { HeliumAccessoryContext } from './types';
import { HeliumIOTPlatform } from './platform';

export enum DeviceType {
  BROWAN_AMBIENT_LIGHT_TBAM100 = 'BROWAN_AMBIENT_LIGHT_TBAM100',
}

export function createDevice(
  type: DeviceType,
  platform: HeliumIOTPlatform,
  accessory: PlatformAccessory<HeliumAccessoryContext>,
  log: Logger,
) {
  log.info(`Creating device for type: ${type.toString()}`);

  switch (type) {
    case DeviceType.BROWAN_AMBIENT_LIGHT_TBAM100:
      new BrowanAmbientLightTBAM100Accessory(platform, accessory);
      break;

    default:
      log.info('Device type not found');
  }
}
