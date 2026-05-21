#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/eduos/current}"
ENV_FILE="${ENV_FILE:-/opt/eduos/.env.production.local}"
PORT="${PORT:-3000}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

export NODE_ENV=production
export PORT

if pm2 describe eduos >/dev/null 2>&1; then
  pm2 restart eduos --update-env
else
  pm2 start "pnpm start" --name eduos --cwd "$APP_DIR"
fi

pm2 save
echo "PM2 process eduos is running. Secret values were not printed."
