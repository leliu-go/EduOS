# Cloud Resource Management

Date: 2026-05-21

## Architecture

EduOS resource metadata stays in RDS. Resource payloads stay in OSS. The local client only receives authorized, time-limited access after ECS verifies RBAC and `tenantId`.

The current storage implementation supports:

- `LocalStorageProvider` for development.
- `AliyunOssStorageProvider` for private OSS buckets.
- Compatibility wrappers under `lib/resources`.

## Aliyun OSS Staging

- Bucket: `eduos-prod-resources-studygo`
- Region: `oss-cn-beijing`
- Endpoint: `https://oss-cn-beijing.aliyuncs.com`
- Optional internal endpoint: `ALIYUN_OSS_INTERNAL_ENDPOINT`
- Optional public signed URL endpoint: `ALIYUN_OSS_PUBLIC_ENDPOINT`
- Bucket ACL: private
- Public access block: enabled

## Resource Metadata

`Resource` includes:

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

Legacy `fileName`, `fileUrl`, and `fileSize` remain during migration and compatibility work.

## Download Flow

1. Client requests a resource through ECS.
2. ECS loads metadata by `tenantId`.
3. ECS verifies role and ownership:
   - students: own assigned/enrolled resources only
   - parents: bound children only
   - teachers: own classes/lessons/authorized students only
   - admin/principal: same tenant only
4. ECS calls the provider to create a signed URL or safe download URL.
5. Client downloads only the authorized object.

The frontend must not build private OSS URLs directly.

## Cache Rules

- Service worker must not cache protected resource APIs.
- Local cache can hold only authorized downloads.
- Local cache is not the system of record.
- Cached resource access should be revocable by future token expiry/versioning rules.

## Smoke Test Rule

OSS smoke tests may use only the `test/` prefix:

```text
test/eduos-smoke.txt
```

If delete permission is tested, only delete objects under `test/`.
