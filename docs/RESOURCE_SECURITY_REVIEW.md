# Resource And OSS Security Review

Date: 2026-05-25

## Reviewed Files

- `features/resources/queries.ts`
- `features/resources/actions.ts`
- `lib/resources/resource-access-policy.ts`
- `lib/resources/download-authorization.ts`
- `lib/storage/aliyun-oss-provider.ts`
- `app/(mobile)/student/resources/[resourceId]/download/route.ts`
- `tests/cloud-resource-provider.test.ts`
- `tests/storage-provider.test.ts`

## Findings

### P0

No confirmed P0 resource download bypass was found in the reviewed student resource path.

### P1/P2 - Parent download policy should be exact before expansion

The shared resource policy helper has a coarse parent branch. It is acceptable for the currently reviewed student download route because parent downloads are not using that route, but it must be tightened before exposing parent resource downloads.

## Positive Controls

- Student visible resources are filtered by `tenantId`, status, permission, enrollment/class relation, and release time.
- Student download route fetches resource detail with the current student user id before signing.
- `createAuthorizedResourceDownloadUrl()` calls `canAccessResourceFile()` before requesting a signed URL.
- Signed URL TTL defaults to 300 seconds.
- OSS provider signs server-side and does not expose `AccessKeySecret`.

## Remaining Risks

- Add parent download endpoint only after exact guardian-child-resource joins are implemented.
- Add teacher download route tests for non-owner class denial.
- Avoid returning `objectKey` to client components unless required for authorized staff operations.

