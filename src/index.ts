import WateringCan from './WateringCan';

const can = new WateringCan({
  deviceConfig: {
    servers: [
      {
        host: 'localhost',
        port: 2137,
      },
    ],
    type: 'watering',
  },
  onOffPattern: [1000, 500],
  relayPin: 1,
  statusInterval: 2000,
});
can.run();

process.on('beforeExit', () => {
  can.destroy();
});
