#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/eduos/current}"
LATEST_VERSION="${LATEST_VERSION:-}"
MIN_SUPPORTED_VERSION="${MIN_SUPPORTED_VERSION:-}"
RELEASE_NOTES="${RELEASE_NOTES:-}"

if [[ -z "$LATEST_VERSION" || -z "$MIN_SUPPORTED_VERSION" ]]; then
  echo "Set LATEST_VERSION and MIN_SUPPORTED_VERSION before updating manifest metadata." >&2
  exit 1
fi

cd "$APP_DIR"

cat <<EOF
Update manifest metadata to set in the server environment:

EDUOS_LATEST_VERSION=${LATEST_VERSION}
EDUOS_MIN_SUPPORTED_VERSION=${MIN_SUPPORTED_VERSION}
EDUOS_RELEASE_NOTES=${RELEASE_NOTES}

Do not write secrets to this metadata. Restart PM2 after updating the environment.
EOF
