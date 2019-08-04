import { Device, DeviceConfig } from 'hhapp-device-protocol';
import { Gpio } from 'onoff';

export default class WateringCan {
  private device: Device;
  private onOffPattern: number[] = [];
  private statusInterval: number;
  private relayControl?: Gpio;
  private relayPin: number;

  private patternIndex = 0;
  private isRelayOn = false;
  private cycleTimeout?: NodeJS.Timeout;

  constructor(config: {
    deviceConfig: DeviceConfig;
    onOffPattern: number[];
    statusInterval: number;
    relayPin: number;
  }) {
    this.device = new Device(config.deviceConfig);
    this.onOffPattern = config.onOffPattern;
    this.statusInterval = config.statusInterval;
    this.relayPin = config.relayPin;
  }

  public run() {
    this.initControl();
    this.initDevice();
  }

  public destroy() {
    this.device.destroy();
    this.stopCycle();
    if (this.relayControl) {
      this.relayControl.unexport();
    }
  }

  private initDevice() {
    this.device.init();
    this.device.setStatusGetter(this.statusGetter);
    this.device.autoStatusOn(this.statusInterval);
    this.device.onAction('wateringCycleOn', () => {
      this.startCycle();
    });
    this.device.onAction('wateringCycleOff', () => {
      this.stopCycle();
    });
  }

  private initControl() {
    this.relayControl = new Gpio(this.relayPin, 'out');
    this.relayOff();
  }

  private startCycle() {
    if (!this.cycleTimeout) {
      this.patternIndex = 0;
      this.relayOn();
      this.cycleLoop();
      this.device.sendStatus(this.statusGetter());
    }
  }
  private stopCycle() {
    if (this.cycleTimeout) {
      clearTimeout(this.cycleTimeout);
    }
    this.relayOff();
    this.device.sendStatus(this.statusGetter());
  }

  private cycleLoop() {
    this.cycleTimeout = setTimeout(() => {
      if (
        this.patternIndex >
        Math.floor(this.onOffPattern.length - 1 / 2) * 2
      ) {
        this.patternIndex = 0;
      }

      if (this.isRelayOn) {
        this.relayOff();
      } else {
        this.relayOn();
      }
      this.device.sendStatus(this.statusGetter());
      this.cycleLoop();
    }, this.onOffPattern[this.patternIndex++]);
  }

  private statusGetter() {
    return {
      isRelayOn: this.isRelayOn,
      isWatering: !!this.cycleTimeout,
    };
  }

  private relayOn() {
    if (this.relayControl) {
      this.relayControl.writeSync(1);
    }
    this.isRelayOn = true;
  }

  private relayOff() {
    if (this.relayControl) {
      this.relayControl.writeSync(0);
    }
    this.isRelayOn = false;
  }
}
