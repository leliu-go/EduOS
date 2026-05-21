#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-/opt/eduos/.env.production.local}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ "${RESOURCE_STORAGE_PROVIDER:-}" != "aliyun-oss" ]]; then
  echo "RESOURCE_STORAGE_PROVIDER must be aliyun-oss for OSS smoke test." >&2
  exit 1
fi

echo "Running OSS smoke test for object test/eduos-smoke.txt. Secrets will not be printed."
pnpm exec tsx scripts/server/oss-smoke-test.ts
