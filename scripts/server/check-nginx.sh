#!/usr/bin/env bash
set -euo pipefail

CONFIG_PATH="${CONFIG_PATH:-/etc/nginx/sites-enabled/eduos.conf}"

echo "Checking nginx syntax."
nginx -t

if [[ -f "$CONFIG_PATH" ]]; then
  grep -q "server_name eduos.study-go.top" "$CONFIG_PATH"
  grep -q "proxy_pass http://127.0.0.1:3000" "$CONFIG_PATH"
  grep -q "client_max_body_size" "$CONFIG_PATH"
  echo "Nginx EduOS config shape looks correct."
else
  echo "Nginx config not found at ${CONFIG_PATH}; syntax check still completed." >&2
fi
