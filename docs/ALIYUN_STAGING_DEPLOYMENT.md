# Aliyun Staging Deployment

Date: 2026-05-21

## Target

- ECS: Ubuntu 22.04
- Domain: `http://eduos.study-go.top`
- App root: `/opt/eduos/current`
- Env file: `/opt/eduos/.env.production.local`
- PM2 process: `eduos`
- Nginx site: `eduos.study-go.top`

## Bootstrap

On ECS:

```bash
sudo bash scripts/server/bootstrap-ubuntu-22.sh
```

## Deploy From GitHub

```bash
cd /opt/eduos/current
bash scripts/server/deploy-staging.sh
```

## Deploy From Uploaded Archive

Upload `artifacts/eduos-stage4-source.tar.gz` to ECS, then run:

```bash
export DEPLOY_SOURCE=archive
export STAGING_ARCHIVE=/opt/eduos/artifacts/eduos-stage4-source.tar.gz
bash scripts/server/deploy-staging.sh
```

## Migration Safety

`deploy-staging.sh` does not run production migrations by default.

Only when a human approves:

```bash
export RUN_PRODUCTION_MIGRATIONS=true
bash scripts/server/deploy-staging.sh
```

The script rejects migration SQL containing obvious destructive patterns before running `pnpm prisma migrate deploy`.

## Smoke Tests

```bash
bash scripts/server/check-rds-connection.sh
bash scripts/server/check-oss-provider.sh
bash scripts/server/smoke-http.sh
```

Do not print `.env.production.local`.
