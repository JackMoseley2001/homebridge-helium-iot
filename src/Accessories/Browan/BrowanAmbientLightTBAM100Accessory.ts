import { HeliumAccessoryContext } from '../../types';
import { HeliumAmbientLightSensorAccessory } from '../common';
import { HeliumIOTPlatform } from '../../platform';
import { PlatformAccessory } from 'homebridge';

export class BrowanAmbientLightTBAM100Accessory extends HeliumAmbientLightSensorAccessory {
  static decodeToLux(payload: Buffer): number {
    return ((payload[5] << 16) | (payload[4] << 8) | payload[3]) / 100;
  }

  constructor(platform: HeliumIOTPlatform, accessory: PlatformAccessory<HeliumAccessoryContext>) {
    super(platform, accessory, BrowanAmbientLightTBAM100Accessory.decodeToLux);
  }
}
