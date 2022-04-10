import {
  API,
  Characteristic,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
} from 'homebridge';
import { DeviceConfig, DeviceType, HeliumAccessoryContext, PluginConfig } from './types';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';

import { BrowanAmbientLightSensorAccessory } from './Accessories';

export class HeliumIOTPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];

  constructor(public readonly log: Logger, public readonly config: PlatformConfig, public readonly api: API) {
    this.log.debug('Finished initializing platform:', PLUGIN_NAME);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  public getPluginConfig(): PluginConfig {
    const devices: DeviceConfig[] = this.config.devices.map((device): DeviceConfig => {
      return {
        type: device.type,
        deviceId: device.device_id,
        port: device.port,
        name: device.name,
        manufacturer: device.manufacturer,
        serialNumber: device.serial_number,
        model: device.model,
        refreshDuration: device.refresh_duration,
      };
    });

    return {
      apiKey: this.config.api_key,
      devices: devices,
    };
  }

  configureAccessory(accessory: PlatformAccessory<HeliumAccessoryContext>) {
    this.log.info('Loading accessory from cache:', accessory.context.device.name);

    this.accessories.push(accessory);
  }

  discoverDevices() {
    for (const device of this.getPluginConfig().devices) {
      const uuid = this.api.hap.uuid.generate(device.deviceId);

      const existingAccessory = this.accessories.find(
        (accessory) => accessory.UUID === uuid,
      ) as PlatformAccessory<HeliumAccessoryContext>;

      if (existingAccessory) {
        this.log.info('Restoring existing accessory from cache:', existingAccessory.context.device.name);
        this.createDevice(existingAccessory.context.device.type, existingAccessory);
      } else {
        this.log.info('Adding new accessory:', device.name);

        const accessory = new this.api.platformAccessory<HeliumAccessoryContext>(device.name, uuid);

        accessory.context.device = device;

        this.createDevice(device.type, accessory);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }

  private createDevice(type: DeviceType, accessory: PlatformAccessory<HeliumAccessoryContext>) {
    this.log.info(`Creating device for type: ${type.toString()}`);
    switch (type) {
      case DeviceType.BROWAN_AMBIENT_LIGHT_SENSOR:
        new BrowanAmbientLightSensorAccessory(this, accessory);
        break;
      default:
        this.log.info('Device type not found');
    }
  }
}
