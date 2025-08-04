module.exports = {
  apps: [{
    name: 'sealed-love-website',
    script: './node_modules/next/dist/bin/next',
    args: 'start',
    cwd: './',
    instances: 4,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      AUTH_TRUST_HOST: 'true',
      NEXTAUTH_URL: 'https://sealed.love'
    },
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    log_file: '/var/log/pm2/website.log',
    out_file: '/var/log/pm2/website-out.log',
    error_file: '/var/log/pm2/website-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    kill_timeout: 5000,
    listen_timeout: 10000,
    min_uptime: '10s',
    max_restarts: 10
  }],
};
