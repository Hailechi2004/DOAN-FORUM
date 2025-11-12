module.exports = {
  apps: [{
    name: 'forum-api',
    script: './dist/server.js',
    instances: 'max', // or specify number like 2, 4
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Restart configuration
    watch: false,
    max_memory_restart: '1G',
    exp_backoff_restart_delay: 100,
    
    // Logging
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Advanced features
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 3000,
    kill_timeout: 5000,
    
    // Graceful shutdown
    wait_ready: true,
    shutdown_with_message: true,
    
    // Monitoring
    vizion: false,
    post_update: ['npm install', 'npm run build']
  }]
};
