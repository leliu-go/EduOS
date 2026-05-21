# Cloud Smoke Test Report

Date: 2026-05-21

## Codex Local Result

Codex did not SSH to ECS because no SSH target or key was provided in the local session. No real cloud secret was read or printed.

Generated for ECS execution:

- `scripts/server/check-rds-connection.sh`
- `scripts/server/check-oss-provider.sh`
- `scripts/server/oss-smoke-test.sh`
- `scripts/server/oss-smoke-test.ts`
- `scripts/server/smoke-http.sh`

## Human-Reported Status

- ECS exists and runs Ubuntu 22.04.
- RDS PostgreSQL exists.
- Database `eduos` and account `eduos_app` exist.
- RDS whitelist includes ECS private IP.
- `/opt/eduos/.env.production.local` exists.
- Domain `eduos.study-go.top` resolves to ECS.
- HTTP is reachable.
- OSS bucket `eduos-prod-resources-studygo` exists and is private.
- OSS credentials are configured on ECS.

## Pending ECS Commands

```bash
cd /opt/eduos/current
bash scripts/server/check-rds-connection.sh
bash scripts/server/check-oss-provider.sh
bash scripts/server/oss-smoke-test.sh
bash scripts/server/smoke-http.sh
```

## Result

Not executed by Codex locally. Awaiting ECS-side run.

## Safety Notes

- No real secret values were read, printed, or committed.
- OSS smoke commands are limited to `test/eduos-smoke.txt`.
- DeleteObject, if available, is limited to the same `test/` object.
- Staging/production Prisma migrations were not executed by Codex.
