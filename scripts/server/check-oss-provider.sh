#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-/opt/eduos/.env.production.local}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

provider="${RESOURCE_STORAGE_PROVIDER:-local}"
echo "Checking storage provider: ${provider}"

if [[ "$provider" == "local" ]]; then
  echo "Local provider configured for development/staging fallback only."
  exit 0
fi

if [[ "$provider" != "aliyun-oss" ]]; then
  echo "Unsupported RESOURCE_STORAGE_PROVIDER: ${provider}" >&2
  exit 1
fi

required=(
  ALIYUN_OSS_ACCESS_KEY_ID
  ALIYUN_OSS_ACCESS_KEY_SECRET
  ALIYUN_OSS_BUCKET
  ALIYUN_OSS_ENDPOINT
)

missing=()
for name in "${required[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    missing+=("$name")
    echo "${name}: missing"
  else
    echo "${name}: set"
  fi
done

if (( ${#missing[@]} > 0 )); then
  echo "Missing OSS variables: ${missing[*]}" >&2
  exit 1
fi

endpoint="${ALIYUN_OSS_ENDPOINT#http://}"
endpoint="${endpoint#https://}"
endpoint="${endpoint%/}"
bucket_host="https://${ALIYUN_OSS_BUCKET}.${endpoint}"

status="$(curl -I -sS -o /dev/null -w "%{http_code}" --connect-timeout 10 "$bucket_host" || true)"
if [[ "$status" == "000" ]]; then
  echo "OSS endpoint check failed without printing credentials." >&2
  exit 1
fi

echo "OSS endpoint reachable with HTTP status ${status}. Private buckets may return 403."
echo "Secret values were not printed."
