# Cloud Resource Management

Date: 2026-05-21

## Current State

EduOS stores resource metadata in PostgreSQL and stores file bytes through a `StorageProvider`.

Implemented providers:

- `LocalStorageProvider` for local development.
- `AliyunOssStorageProvider` for private Aliyun OSS buckets.
- `cloud-placeholder` remains available for explicit disabled-cloud states.

The app must not store course resources, videos, question banks, word books, or uploaded payloads in git, deployments, or installers.

## Storage Metadata

`Resource` now has additive storage metadata fields:

- `provider`
- `bucket`
- `objectKey`
- `originalName`
- `mimeType`
- `size`
- `checksum`
- `visibility`
- `tenantId`
- `createdById`
- `status`

Existing legacy fields `fileName`, `fileUrl`, and `fileSize` remain for backward compatibility while private storage is adopted.

## Provider Flow

1. Server validates metadata and user permissions.
2. Server writes bytes with `StorageProvider.putObject`.
3. Server saves metadata, including provider, bucket, object key, size, checksum, visibility, and tenant.
4. Download requests call server-side authorization first.
5. Only authorized requests call `createSignedDownloadUrl`.
6. The frontend receives a time-limited URL, not raw credentials.

## Authorization Rules

- Admin and principal roles manage resources inside their own tenant.
- Teachers can access resources for their own course, class, or lesson scope.
- Students can access only released resources assigned to their own student account or enrolled class/course.
- Parents must be explicitly bound guardians before parent resource access is allowed.
- Cross-tenant access fails before URL signing.

## Environment Variables

Required for Aliyun OSS:

```text
RESOURCE_STORAGE_PROVIDER=aliyun-oss
ALIYUN_OSS_ACCESS_KEY_ID=
ALIYUN_OSS_ACCESS_KEY_SECRET=
ALIYUN_OSS_BUCKET=
ALIYUN_OSS_ENDPOINT=
ALIYUN_OSS_REGION=
ALIYUN_OSS_SIGNED_URL_TTL_SECONDS=300
```

Development local provider:

```text
RESOURCE_STORAGE_PROVIDER=local
RESOURCE_STORAGE_LOCAL_ROOT=.local/resource-storage
RESOURCE_STORAGE_LOCAL_BUCKET=local-resource-storage
```

Real values belong only in `.env.production.local` or the deployment platform secret manager. Do not commit them.

## Verification

Local safe checks:

```powershell
pnpm vitest run tests/storage-provider.test.ts tests/resource-download-authorization.test.ts tests/resource-storage-metadata.test.ts
.\scripts\check-production-env.ps1
.\scripts\check-storage-provider.ps1
```

OSS endpoint smoke check after the bucket and environment variables are ready:

```powershell
$env:RESOURCE_STORAGE_PROVIDER="aliyun-oss"
.\scripts\check-production-env.ps1
.\scripts\check-storage-provider.ps1 -CheckEndpoint
```

The scripts print only variable presence and connection status. They do not print secret values.

## Migration Note

The local development database was synchronized with `pnpm prisma db push` after additive schema changes. No `prisma migrate reset`, drop, destructive migration, production migration, or irreversible operation was executed.
