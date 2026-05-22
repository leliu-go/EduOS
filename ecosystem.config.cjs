module.exports = {
  apps: [
    {
      name: "eduos",
      cwd: process.env.EDUOS_APP_DIR || "/opt/eduos/current",
      script: ".next/standalone/server.js",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "127.0.0.1",
      },
      time: true,
      max_memory_restart: "768M",
    },
  ],
};
