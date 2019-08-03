import WateringCan from '../src/WateringCan';
import { Manager } from 'hhapp-device-protocol';
jest.mock('onoff');

describe('Watering can test', () => {
  let can: WateringCan;
  let canConfig: any;
  let manager: Manager;
  beforeEach(done => {
    canConfig = {
      deviceConfig: {
        type: 'watering',
        servers: [
          {
            host: 'localhost',
            port: 2137,
          },
        ],
      },
      onOffPattern: [1000, 500],
      statusInterval: 2000,
      relayPin: 1,
    };

    manager = new Manager({
      port: 2137,
    });
    done();
  });

  afterEach(done => {
    can.destroy();
    manager.destroy();
    done();
  });

  it('shold init', () => {
    can = new WateringCan(canConfig);
    expect(can).toBeInstanceOf(WateringCan);
  });

  it('should connect to manager', done => {
    can = new WateringCan(canConfig);
    can.run();
    manager.onConnection(() => {
      done();
    });
  });

  it('should send status to manager', done => {
    can = new WateringCan(canConfig);
    can.run();
    manager.onStatus({ type: 'watering' }, status => {
      expect(status.device.type).toBe('watering');
      expect(status.payload.isWatering).toBeFalsy();
      done();
    });
  });

  it('should respond to action sent with status', done => {
    can = new WateringCan(canConfig);
    can.run();
    let fn = jest.fn(status => {
      expect(status.device.type).toBe('watering');
    });
    manager.onStatus({ type: 'watering' }, fn);
    setTimeout(() => {
      manager.sendAction({ action: 'wateringCycleOn', type: 'watering' }, {});
      setTimeout(() => {
        manager.sendAction(
          { action: 'wateringCycleOff', type: 'watering' },
          {}
        );
        setTimeout(() => {
          expect(fn).toHaveBeenCalledTimes(2);
          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('should send status periodically', done => {
    canConfig.statusInterval = 30;
    can = new WateringCan(canConfig);
    can.run();
    let fn = jest.fn(status => {
      expect(status.device.type).toBe('watering');
    });
    manager.onStatus({ type: 'watering' }, fn);

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(4);
      done();
    }, 140);
  });

  it('should send status periodically and control relay', done => {
    jest.useRealTimers()
    canConfig.onOffPattern = [30, 80];
    can = new WateringCan(canConfig);
    can.run();
    let called = 0
    let expectedStatus = true
    let fn = jest.fn(status => {
      expect(status.payload.isWatering).toBeTruthy()
      expect(status.payload.isRelayOn).toBe(expectedStatus)
      expect(status.device.type).toBe('watering');
      expectedStatus = !expectedStatus
      called++
    });

    manager.onStatus({ type: 'watering' }, fn);
    manager.onConnection((device) => {
      device.sendAction('wateringCycleOn', {});
      device.sendAction('wateringCycleOn', {});
      setTimeout(() => {
        expect(called).toBeGreaterThanOrEqual(1);
        done();
      }, 200);
    })
  });
});
