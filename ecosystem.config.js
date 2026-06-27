/**
 * PM2 Ecosystem config for Ulric-X MD
 * Start with: pm2 start ecosystem.config.js
 * Logs:      pm2 logs ulric-x-md
 * Restart:   pm2 restart ulric-x-md
 * Stop:      pm2 stop ulric-x-md
 */
module.exports = {
  apps: [{
    name: 'ulric-x-md',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env',
    output: './logs/out.log',
    error: './logs/err.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    time: true,
    exp_backoff_restart_delay: 1000,
    max_restarts: 20,
    kill_timeout: 5000
  }]
};
