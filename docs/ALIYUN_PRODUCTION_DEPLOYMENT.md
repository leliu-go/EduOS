# Aliyun Production Deployment Guide

## Current Target

- Domain: `https://eduos.study-go.top`
- ECS: Ubuntu 22.04
- RDS: PostgreSQL database `eduos`
- OSS: private bucket for resources
- Nginx: reverse proxy to `127.0.0.1:3000`
- PM2: process name `eduos`

## HTTPS

PWA installation should use HTTPS in production.

Install and run certbot manually on ECS:

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d eduos.study-go.top
sudo nginx -t
sudo systemctl reload nginx
```

Record certificate status in deployment notes. Do not commit any private key material.

## Production Deploy

```bash
cd /opt/eduos/current
ENV_FILE=/opt/eduos/.env.production.local bash scripts/server/deploy-production.sh
```

Default behavior skips migration. To run an approved migration:

```bash
RUN_PRODUCTION_MIGRATIONS=true ENV_FILE=/opt/eduos/.env.production.local bash scripts/server/deploy-production.sh
```

Only use `RUN_PRODUCTION_MIGRATIONS=true` after backup, SQL review, and human approval.

## Nginx Requirements

- `server_name eduos.study-go.top`
- listen on 80 and, after certbot, 443
- reverse proxy to `http://127.0.0.1:3000`
- preserve `X-Forwarded-Proto`
- set `client_max_body_size 50m` or an approved value

## Secret Handling

`.env.production.local` stays on ECS and is never committed. Scripts source it without printing values.
