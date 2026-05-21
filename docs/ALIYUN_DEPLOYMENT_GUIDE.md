# Aliyun OSS Deployment Guide

Date: 2026-05-21

## Human Console Setup

Create these in the Aliyun console:

- A private OSS bucket for EduOS resource files.
- A least-privilege RAM user or role that can `PutObject` and `GetObject` only for the selected bucket/prefix.
- A region and endpoint matching the deployment region.
- Server-side encryption policy if required by the institution.
- Lifecycle rules for temporary or obsolete files.

Do not create or paste real keys into source code.

## Required Environment

Set these on the production host or secret manager:

```text
RESOURCE_STORAGE_PROVIDER=aliyun-oss
ALIYUN_OSS_ACCESS_KEY_ID=
ALIYUN_OSS_ACCESS_KEY_SECRET=
ALIYUN_OSS_BUCKET=
ALIYUN_OSS_ENDPOINT=
ALIYUN_OSS_REGION=
ALIYUN_OSS_SIGNED_URL_TTL_SECONDS=300
```

Recommended endpoint format:

```text
ALIYUN_OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
```

Do not include the bucket in `ALIYUN_OSS_ENDPOINT`; the provider builds `https://<bucket>.<endpoint>/<objectKey>`.

## Smoke Test

After setting environment variables:

```powershell
.\scripts\check-production-env.ps1
.\scripts\check-storage-provider.ps1 -CheckEndpoint
```

Expected result:

- All required variables show `set`.
- Endpoint check returns an HTTP status. A private bucket may return `403`; that still proves the host is reachable.
- No secret values are printed.

## Rollback

If OSS is not ready:

```text
RESOURCE_STORAGE_PROVIDER=local
```

Use local provider only for development or emergency staging diagnostics. Do not package local payloads.
