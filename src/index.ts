import Device from 'hhapp-device-protocol/lib/Device/Device';
let device = new Device({
  type: 'watering',
  servers: [
    {
      port: 2137,
      host: 'localhost',
    },
  ],
});

device.init();
