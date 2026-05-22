#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/eduos/current}"
ROLLBACK_REF="${ROLLBACK_REF:-}"

if [[ -z "$ROLLBACK_REF" ]]; then
  echo "Set ROLLBACK_REF to a known-good git commit or tag before rollback." >&2
  exit 1
fi

cd "$APP_DIR"
git fetch --all --tags
git checkout "$ROLLBACK_REF"
pnpm install --frozen-lockfile
pnpm prisma generate
pnpm build

if pm2 describe eduos >/dev/null 2>&1; then
  pm2 restart eduos --update-env
else
  pm2 start ecosystem.config.cjs --only eduos --update-env
fi

echo "PM2 rollback to ${ROLLBACK_REF} completed. No database rollback or OSS deletion was performed."
