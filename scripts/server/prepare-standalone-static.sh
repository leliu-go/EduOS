#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$(pwd)}"

if [[ ! -f "$APP_DIR/.next/standalone/server.js" ]]; then
  echo "Standalone server not found at ${APP_DIR}/.next/standalone/server.js" >&2
  exit 1
fi

mkdir -p "$APP_DIR/.next/standalone/.next/static"
cp -a "$APP_DIR/.next/static/." "$APP_DIR/.next/standalone/.next/static/"

if [[ -d "$APP_DIR/public" ]]; then
  mkdir -p "$APP_DIR/.next/standalone/public"
  cp -a "$APP_DIR/public/." "$APP_DIR/.next/standalone/public/"
fi

echo "Prepared standalone static assets without printing secrets."
