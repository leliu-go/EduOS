#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/eduos/current}"
REPO_URL="${REPO_URL:-https://github.com/leliu-go/EduOS.git}"
BRANCH="${BRANCH:-main}"
DEPLOY_SOURCE="${DEPLOY_SOURCE:-git}"
STAGING_ARCHIVE="${STAGING_ARCHIVE:-/opt/eduos/artifacts/eduos-stage4-source.tar.gz}"
ENV_FILE="${ENV_FILE:-/opt/eduos/.env.production.local}"
RUN_PRODUCTION_MIGRATIONS="${RUN_PRODUCTION_MIGRATIONS:-false}"

load_env() {
  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
  else
    echo "Env file not found at ${ENV_FILE}." >&2
    exit 1
  fi
}

sync_source() {
  mkdir -p "$APP_DIR"

  if [[ "$DEPLOY_SOURCE" == "archive" ]]; then
    if [[ ! -f "$STAGING_ARCHIVE" ]]; then
      echo "Archive not found: ${STAGING_ARCHIVE}" >&2
      exit 1
    fi
    rm -rf "${APP_DIR:?}/"*
    tar -xzf "$STAGING_ARCHIVE" -C "$APP_DIR"
    return
  fi

  if [[ -d "$APP_DIR/.git" ]]; then
    git -C "$APP_DIR" fetch origin "$BRANCH"
    git -C "$APP_DIR" checkout "$BRANCH"
    git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
  else
    rm -rf "${APP_DIR:?}/"*
    git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
  fi
}

reject_unsafe_migrations() {
  if [[ ! -d prisma/migrations ]]; then
    echo "No prisma/migrations directory found. Refusing automatic production migration." >&2
    exit 1
  fi

  if grep -RInE 'DROP[[:space:]]+TABLE|DROP[[:space:]]+COLUMN|TRUNCATE|DELETE[[:space:]]+FROM|prisma[[:space:]]+migrate[[:space:]]+reset' prisma/migrations; then
    echo "Unsafe migration pattern found. Refusing production migration." >&2
    exit 1
  fi
}

load_env
sync_source
cd "$APP_DIR"

pnpm install
pnpm prisma generate
pnpm build

if [[ "$RUN_PRODUCTION_MIGRATIONS" == "true" ]]; then
  reject_unsafe_migrations
  pnpm prisma migrate deploy
else
  echo "Skipping production migrations. Set RUN_PRODUCTION_MIGRATIONS=true only after human approval."
fi

bash scripts/server/start-pm2.sh
echo "Staging deploy complete. Secret values were not printed."
