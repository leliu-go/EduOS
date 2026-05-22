module.exports = {
  apps: [
    {
      name: "eduos",
      cwd: process.env.EDUOS_APP_DIR || "/opt/eduos/current",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      time: true,
      max_memory_restart: "768M",
    },
  ],
};
