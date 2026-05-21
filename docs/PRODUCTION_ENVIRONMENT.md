# Production Environment

Date: 2026-05-21

## Files

- `.env.production.example`: committed template with empty placeholders.
- `.env.production.local`: local or deployment-only real values. Must not be committed.
- `.env.example`: development template.

## Checks

Run:

```powershell
.\scripts\check-production-env.ps1
.\scripts\check-storage-provider.ps1
```

For production database readiness, also run:

```powershell
.\scripts\check-production-env.ps1 -Production
```

The checks report whether variables are set or missing. They do not print values.

## Required For OSS

```text
RESOURCE_STORAGE_PROVIDER=aliyun-oss
ALIYUN_OSS_ACCESS_KEY_ID=
ALIYUN_OSS_ACCESS_KEY_SECRET=
ALIYUN_OSS_BUCKET=
ALIYUN_OSS_ENDPOINT=
```

## Required For RDS

```text
DATABASE_URL=
```

RDS smoke tests should be read-only connection checks or non-production migration previews. Do not run destructive migrations, `prisma migrate reset`, or database drops.
