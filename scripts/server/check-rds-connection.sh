#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-/opt/eduos/.env.production.local}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is missing." >&2
  exit 1
fi

echo "Checking RDS connection with DATABASE_URL present. Value is redacted."
PGCONNECT_TIMEOUT="${PGCONNECT_TIMEOUT:-10}" psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -Atc "select 'rds_ok';" | grep -qx "rds_ok"
echo "RDS connection check passed. Secret values were not printed."
