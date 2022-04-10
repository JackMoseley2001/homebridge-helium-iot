import { Logger, PlatformAccessory, Service } from 'homebridge';

import { HeliumAccessoryContext } from '../../types';
import { HeliumIOTPlatform } from '../../platform';
import { fetchLatestEvent } from '../../api';

export class HeliumAmbientLightSensorAccessory {
  private service: Service;
  private log: Logger;

  private MIN_LUX = 0.0001;

  private state: { luxValue: number | null } = {
    luxValue: null,
  };

  constructor(
    private readonly platform: HeliumIOTPlatform,
    private readonly accessory: PlatformAccessory<HeliumAccessoryContext>,
    private readonly luxDecoder: (input: Buffer) => number,
  ) {
    const device = this.accessory.context.device;

    this.log = platform.log;
    this.log.info(`Initalising ${device.name}`);

    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, device.manufacturer)
      .setCharacteristic(this.platform.Characteristic.Model, device.model)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, device.serialNumber)
      .setCharacteristic(this.platform.Characteristic.Name, device.name);

    this.service =
      this.accessory.getService(this.platform.Service.LightSensor) ||
      this.accessory.addService(this.platform.Service.LightSensor);

    this.fetchAndUpdateLatestLux();
    this.setupTimer();

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
      .onGet(this.handleCurrentAmbientLightLevelGet.bind(this));
  }

  private async fetchAndUpdateLatestLux(): Promise<number> {
    const device = this.accessory.context.device;
    this.log.info(`Updating ${device.name}`);

    try {
      const event = await fetchLatestEvent(device, this.platform.getPluginConfig().apiKey);
      const payload = event?.data.payload;

      if (payload === undefined) {
        throw new Error('Payload was found null');
      }

      this.log.info(`Recieved value for ${device.name}`);

      const lux = this.luxDecoder(payload);
      this.state.luxValue = lux > this.MIN_LUX ? lux : this.MIN_LUX;
      this.service
        .getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
        .setValue(this.state.luxValue);

      return this.state.luxValue;
    } catch (error) {
      this.log.error(`Failed to update ${device.name} - ${error}`);
      return this.MIN_LUX;
    }
  }

  private setupTimer() {
    const device = this.accessory.context.device;
    this.log.info(`Starting automatic refresh for ${device.name}`);

    setInterval(() => {
      this.fetchAndUpdateLatestLux();
    }, device.refreshDuration * 1000);
  }

  async handleCurrentAmbientLightLevelGet() {
    this.log.debug('Triggered GET CurrentAmbientLightLevel');
    if (this.state.luxValue === null) {
      return await this.fetchAndUpdateLatestLux();
    }

    const lux = this.state.luxValue;
    return lux > this.MIN_LUX ? lux : this.MIN_LUX;
  }
}
