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

### P1/P2 - Parent download policy should be exact before expansion - fixed 2026-05-26

The shared resource policy helper previously had a coarse parent branch. It has been tightened before exposing parent resource downloads.

Fix applied:

- Parent access requires explicit guardian user scope.
- If a resource declares `studentUserIds`, the parent's `guardianStudentUserIds` must overlap that list.
- Added a regression case where a parent bound to `student-1` cannot access a resource scoped to `student-2`.

## Positive Controls

- Student visible resources are filtered by `tenantId`, status, permission, enrollment/class relation, and release time.
- Student download route fetches resource detail with the current student user id before signing.
- `createAuthorizedResourceDownloadUrl()` calls `canAccessResourceFile()` before requesting a signed URL.
- Signed URL TTL defaults to 300 seconds.
- OSS provider signs server-side and does not expose `AccessKeySecret`.
- Parent policy now checks exact child/resource intersection when explicit student scope is available.

## Remaining Risks

- Add parent download endpoint only after route-level database joins pass exact guardian-child-resource scope into the shared helper.
- Add teacher download route tests for non-owner class denial.
- Avoid returning `objectKey` to client components unless required for authorized staff operations.
