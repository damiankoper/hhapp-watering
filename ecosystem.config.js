module.exports = {
  apps : [{
    name: 'WateringCan',
    script: 'dist/index.js',

    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      MANAGER_URL:'192.168.43.216',
      MANAGER_PORT: 3001,
      RELAY_PIN: 17,
    },
    env_production: {
      NODE_ENV:  'production',
      MANAGER_URL:'80.211.177.236',
      MANAGER_PORT: 3001,
      RELAY_PIN: 17,
    }
  }],

  deploy : {
    development : {
      user : 'pi',
      host : '192.168.43.55',
      ref  : 'origin/master',
      repo : 'git@github.com:damiankoper/hhapp-watering.git',
      path : '/home/pi/watering/development',
      'post-deploy' : 'node -v && npm install --verbose && npx pm2 stop all --silent || npm run build && npx pm2 startOrReload ecosystem.config.js'
    },
    production : {
      user : 'pi',
      host : '192.168.43.55',
      ref  : 'origin/master',
      repo : 'git@github.com:damiankoper/hhapp-watering.git',
      path : '/home/pi/watering/production',
      'post-deploy' : 'node -v && npm install && npx pm2 stop all --silent || npm run build && npx pm2 startOrReload ecosystem.config.js --env production'
    }
  }
};
