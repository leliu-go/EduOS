#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/eduos/current}"
REPO_URL="${REPO_URL:-https://github.com/leliu-go/EduOS.git}"
BRANCH="${BRANCH:-main}"
DEPLOY_SOURCE="${DEPLOY_SOURCE:-git}"
PRODUCTION_ARCHIVE="${PRODUCTION_ARCHIVE:-/opt/eduos/artifacts/eduos-production-source.tar.gz}"
ENV_FILE="${ENV_FILE:-/opt/eduos/.env.production.local}"
RUN_PRODUCTION_MIGRATIONS="${RUN_PRODUCTION_MIGRATIONS:-false}"
HEALTH_URL="${HEALTH_URL:-https://eduos.study-go.top}"
DEPLOYMENT_HISTORY_PATH="${DEPLOYMENT_HISTORY_PATH:-docs/DEPLOYMENT_HISTORY.md}"

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

assert_safe_app_dir() {
  case "$APP_DIR" in
    /opt/eduos/*) ;;
    *)
      echo "APP_DIR must stay under /opt/eduos for production deploy safety: ${APP_DIR}" >&2
      exit 1
      ;;
  esac
}

sync_source() {
  mkdir -p "$APP_DIR"
  assert_safe_app_dir

  if [[ "$DEPLOY_SOURCE" == "archive" ]]; then
    if [[ ! -f "$PRODUCTION_ARCHIVE" ]]; then
      echo "Archive not found: ${PRODUCTION_ARCHIVE}" >&2
      exit 1
    fi
    find "$APP_DIR" -mindepth 1 -maxdepth 1 ! -name ".env.production.local" -exec rm -rf {} +
    tar -xzf "$PRODUCTION_ARCHIVE" -C "$APP_DIR"
    return
  fi

  if [[ -d "$APP_DIR/.git" ]]; then
    git -C "$APP_DIR" fetch origin "$BRANCH"
    git -C "$APP_DIR" checkout "$BRANCH"
    git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
  else
    find "$APP_DIR" -mindepth 1 -maxdepth 1 ! -name ".env.production.local" -exec rm -rf {} +
    git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
  fi
}

reject_unsafe_migrations() {
  if [[ ! -d prisma/migrations ]]; then
    echo "No prisma/migrations directory found. Refusing automatic production migration." >&2
    exit 1
  fi

  if grep -RInE 'DROP[[:space:]]+TABLE|DROP[[:space:]]+COLUMN|TRUNCATE|DELETE[[:space:]]+FROM[[:space:]]+[^;]+(;|$)|prisma[[:space:]]+migrate[[:space:]]+reset' prisma/migrations; then
    echo "Unsafe migration pattern found. Refusing production migration." >&2
    exit 1
  fi
}

append_deployment_history() {
  local git_commit
  git_commit="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
  {
    echo ""
    echo "## $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo ""
    echo "- Environment: production"
    echo "- Commit: ${git_commit}"
    echo "- Source: ${DEPLOY_SOURCE}"
    echo "- Migrations: ${RUN_PRODUCTION_MIGRATIONS}"
    echo "- Health URL: ${HEALTH_URL}"
  } >> "$DEPLOYMENT_HISTORY_PATH"
}

load_env
sync_source
cd "$APP_DIR"

pnpm install --frozen-lockfile
pnpm prisma generate

if [[ "$RUN_PRODUCTION_MIGRATIONS" == "true" ]]; then
  echo "Production migration requested. Confirm backup exists before running this script."
  reject_unsafe_migrations
  pnpm prisma migrate deploy
else
  echo "Skipping production migrations. Set RUN_PRODUCTION_MIGRATIONS=true only after explicit human approval."
fi

pnpm build
APP_DIR="$APP_DIR" bash scripts/server/prepare-standalone-static.sh

if pm2 describe eduos >/dev/null 2>&1; then
  pm2 restart eduos --update-env
else
  pm2 start ecosystem.config.cjs --only eduos --update-env
fi

BASE_URL="$HEALTH_URL" bash scripts/server/health-check.sh
append_deployment_history
echo "Production deploy complete. Secret values were not printed."
