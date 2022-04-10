import { Logger, PlatformAccessory, Service } from 'homebridge';

import { BrowanLightSensorPlatform } from '../../platform';
import { HeliumAccessoryContext } from '../../types';
import { fetchLatestEvent } from '../../api';

export class BrowanAmbientLightSensorAccessory {
  private service: Service;
  private log: Logger;

  private state: { luxValue: number | null; lastUpdated: Date | null; intervalId: NodeJS.Timer | null } = {
    luxValue: null,
    lastUpdated: null,
    intervalId: null,
  };

  constructor(
    private readonly platform: BrowanLightSensorPlatform,
    private readonly accessory: PlatformAccessory<HeliumAccessoryContext>,
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

    this._fetchAndUpdateLatestLux();
    this._setupTimer();

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
      .onGet(this.handleCurrentAmbientLightLevelGet.bind(this));
  }

  async _fetchAndUpdateLatestLux() {
    const device = this.accessory.context.device;
    this.log.info(`Updating ${device.name}`);
    const event = await fetchLatestEvent(device, this.platform.getPluginConfig().apiKey);
    const payload = event?.data.payload;

    if (payload === undefined) {
      this.log.error('Payload was found null');
      return;
    }

    const decoded = this._decoder(payload);

    this.log.info(`Recieved value for ${device.name}`);

    this.state.luxValue = decoded.lux;
    this.service.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel).setValue(decoded.lux);
  }

  _setupTimer() {
    this.log.info('Starting automatic refresh');
    this.state.intervalId = setInterval(() => {
      this._fetchAndUpdateLatestLux();
    }, this.platform.getPluginConfig().refreshTime * 1000);
  }

  _decoder(bytes: Buffer): {
    darker: boolean;
    lighter: boolean;
    status_change: boolean;
    keep_alive: boolean;
    lux: number;
    board_temp: number;
    battery: number;
  } {
    const decoded: {
      darker: boolean;
      lighter: boolean;
      status_change: boolean;
      keep_alive: boolean;
      lux: number;
      board_temp: number;
      battery: number;
    } = {
      darker: false,
      lighter: false,
      status_change: false,
      keep_alive: false,
      lux: 0,
      board_temp: 0,
      battery: 0,
    };

    // Status measurement
    decoded.darker = this.bit(bytes[0], 0);
    decoded.lighter = this.bit(bytes[0], 1);
    decoded.status_change = this.bit(bytes[0], 4);
    decoded.keep_alive = this.bit(bytes[0], 5);

    // Lux
    decoded.lux = ((bytes[5] << 16) | (bytes[4] << 8) | bytes[3]) / 100;

    // Board temp measurement
    let temp_board = bytes[2] & 0x7f;
    temp_board = temp_board - 32;
    decoded.board_temp = temp_board;

    // Battery measurements
    let battery = bytes[1] & 0x0f;
    battery = (25 + battery) / 10;
    decoded.battery = battery;

    return decoded;
  }

  // Gets the boolean value of the given bit
  bit(value: any, bit: any) {
    return (value & (1 << bit)) > 0;
  }

  async handleCurrentAmbientLightLevelGet() {
    this.log.debug('Triggered GET CurrentAmbientLightLevel');
    return this.state.luxValue;
  }
}
