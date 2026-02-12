module.exports = {
  apps: [
    {
      name: 'backend-api',
      script: 'src/server.js',
      cwd: '/home/user/webapp/backend',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      }
    }
  ]
}
