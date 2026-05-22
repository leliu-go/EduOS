#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://eduos.study-go.top}"

echo "Checking EduOS health at ${BASE_URL}."
status="$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 10 "${BASE_URL}/api/version" || true)"

if [[ "$status" != "200" ]]; then
  echo "Health check failed: /api/version returned HTTP ${status}." >&2
  exit 1
fi

echo "EduOS health check passed. No secret values were printed."
