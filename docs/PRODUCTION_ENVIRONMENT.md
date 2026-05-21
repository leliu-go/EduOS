# Production Environment

Date: 2026-05-21

## Environment Files

- `.env.production.example`: committed placeholder template.
- `/opt/eduos/.env.production.local`: server-side real values on ECS.
- `.env.production.local`: must never be committed.

Do not print or paste real values into logs, docs, commits, screenshots, or terminal output.

## Required For ECS Runtime

```text
NODE_ENV=production
DATABASE_URL=
AUTH_SECRET=
CHECK_IN_QR_SECRET=
NEXT_PUBLIC_APP_URL=
```

## Required For Aliyun OSS

```text
RESOURCE_STORAGE_PROVIDER=aliyun-oss
ALIYUN_OSS_ACCESS_KEY_ID=
ALIYUN_OSS_ACCESS_KEY_SECRET=
ALIYUN_OSS_BUCKET=eduos-prod-resources-studygo
ALIYUN_OSS_ENDPOINT=https://oss-cn-beijing.aliyuncs.com
ALIYUN_OSS_INTERNAL_ENDPOINT=
ALIYUN_OSS_PUBLIC_ENDPOINT=
ALIYUN_OSS_REGION=oss-cn-beijing
ALIYUN_OSS_SIGNED_URL_TTL_SECONDS=300
```

The first stage can use `ALIYUN_OSS_ENDPOINT` alone. The provider also supports optional split endpoints:

- `ALIYUN_OSS_INTERNAL_ENDPOINT` for ECS-to-OSS traffic.
- `ALIYUN_OSS_PUBLIC_ENDPOINT` for browser signed URLs.

If the split endpoint values are empty, EduOS falls back to `ALIYUN_OSS_ENDPOINT`.

## RDS Rules

- Local clients never connect to RDS.
- ECS reads `DATABASE_URL` from `/opt/eduos/.env.production.local`.
- Do not run `prisma migrate reset`, `drop database`, `truncate`, or production data deletion commands.
- Staging migrations require explicit human approval unless the database is confirmed empty and migration SQL is additive.

## Secret Checks

Use presence-only checks:

```bash
scripts/server/check-rds-connection.sh
scripts/server/check-oss-provider.sh
```

These scripts must not print passwords, AccessKey secrets, or full connection strings.
