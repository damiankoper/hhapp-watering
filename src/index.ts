import WateringCan from './WateringCan';

const can = new WateringCan({
  deviceConfig: {
    servers: [
      {
        host: process.env.MANAGER_URL as string,
        port: parseInt(process.env.MANAGER_PORT as string, 10),
      },
    ],
    type: 'watering',
  },
  onOffPattern: [1000, 500, 100, 800, 100],
  relayPin: parseInt(process.env.RELAY_PIN as string, 10),
  statusInterval: 2000,
});
can.run();

process.on('beforeExit', () => {
  can.destroy();
});
