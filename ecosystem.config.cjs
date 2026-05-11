module.exports = {
  apps: [
    {
      name: 's3-upload-api',
      script: 'src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_file: '.env',
      watch: false,
      max_memory_restart: '300M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
