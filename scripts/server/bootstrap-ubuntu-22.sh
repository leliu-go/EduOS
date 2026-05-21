#!/usr/bin/env bash
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this script with sudo or as root." >&2
  exit 1
fi

apt-get update
apt-get install -y curl git nano vim unzip nginx postgresql-client ca-certificates gnupg

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
  apt-get install -y nodejs
fi

corepack enable
corepack prepare pnpm@latest --activate

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

mkdir -p /opt/eduos/artifacts /opt/eduos/current
chown -R "${SUDO_USER:-root}:${SUDO_USER:-root}" /opt/eduos

echo "Ubuntu 22.04 bootstrap complete. Secret values were not printed."
