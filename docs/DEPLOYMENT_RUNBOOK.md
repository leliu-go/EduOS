# EduOS Deployment Runbook

## Architecture

EduOS production is:

```text
PWA / optional desktop shell
  -> Nginx on Aliyun ECS
  -> Next.js backend/API managed by PM2
  -> Aliyun RDS PostgreSQL
  -> Aliyun OSS private bucket
```

## Standard Git Deployment

On ECS:

```bash
cd /opt/eduos/current
git pull --ff-only origin main
pnpm install --frozen-lockfile
pnpm prisma generate
pnpm build
pm2 restart eduos --update-env
BASE_URL=https://eduos.study-go.top bash scripts/server/health-check.sh
```

## Optional Migration

Production migrations are skipped by default. Only run after explicit human approval:

```bash
RUN_PRODUCTION_MIGRATIONS=true bash scripts/server/deploy-production.sh
```

The deploy script scans migration SQL for `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, broad `DELETE FROM`, and `prisma migrate reset`.

## Network Fallbacks

If GitHub pull fails:

- upload a tar.gz source artifact,
- upload a git bundle,
- upload format-patch files,
- set `DEPLOY_SOURCE=archive` and `PRODUCTION_ARCHIVE=/opt/eduos/artifacts/eduos-production-source.tar.gz`.

## Validation

Run:

```bash
bash scripts/server/check-rds-connection.sh
bash scripts/server/check-oss-provider.sh
bash scripts/server/check-nginx.sh
bash scripts/server/health-check.sh
```

Scripts do not print secret values.
