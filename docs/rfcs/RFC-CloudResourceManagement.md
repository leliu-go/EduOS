# RFC: Cloud Resource Management

## Background

EduOS must not bundle course resources, videos, handouts, word books, question banks, or uploaded files into source control, web deployments, or Windows installers. Resource metadata belongs in PostgreSQL. Resource files belong behind a storage provider and are accessed only after server-side permission checks.

## Goals

- Keep one EduOS app for all roles.
- Store metadata in the database and files in storage providers.
- Support a local provider for development.
- Leave production cloud storage as an explicit provider placeholder.
- Issue signed URL style download links only after tenant and role checks.
- Keep resource files out of git, deployments, and installers.

## Non-goals

- No paid cloud storage service is created during this run.
- No real cloud keys are generated or committed.
- No bulk resource migration is executed.

## Affected Roles

- Admin and academic staff manage tenant resources.
- Teachers manage resources for their own courses/classes/lessons.
- Students access assigned and released resources.
- Parents access resources only through bound students.

## Recommended Architecture

Use `Resource` and `ResourcePermission` for metadata and authorization. Store file bytes through `ResourceStorageProvider`. Local development uses `LocalResourceStorageProvider`; production should add a cloud adapter behind the same interface.

## Data Model Changes

Existing resource metadata already includes file name, URL, MIME type, size, tenant, bindings, and permissions. A later non-destructive migration can add `storageProvider`, `storageKey`, `checksumSha256`, `downloadCount`, and `cachePolicyJson`.

## API / Server Action Design

1. Validate upload metadata with Zod.
2. Require server-side RBAC.
3. Validate tenant and role scope.
4. Store bytes through storage provider.
5. Save metadata and permissions.
6. Audit create, release, permission, and download events.
7. Create signed URL only after permission checks.

## Permission Rules

Students cannot access unauthorized resources. Parents only access bound students' resources. Teachers only access own class/lesson resources. Tenant staff can manage tenant resources according to RBAC.

## Tenant Isolation

Every query and storage key includes `tenantId`. Provider adapters must never accept cross-tenant download requests.

## UI Changes

Resource screens should show metadata, release status, and download/open actions. Large resources should be downloaded on demand, not preloaded.

## Security Considerations

Do not expose storage keys, service keys, or raw bucket names to client components. Do not cache protected resource APIs in the service worker.

## Testing Plan

- Provider unit tests for local storage.
- Policy tests for tenant, teacher, student, and parent access.
- E2E tests for protected student/teacher resource pages.

## Migration Plan

Draft a non-destructive migration that adds provider metadata columns. Execute only after human review and backup confirmation.

## Rollback Plan

Keep existing `fileUrl` metadata until production provider migration is verified. Disable cloud provider by setting `RESOURCE_STORAGE_PROVIDER=local`.

## High-risk Items Not Executed

- No paid cloud storage account was created.
- No production bucket was created.
- No storage credentials were generated.
- No irreversible migration or bulk resource move was run.

## Human Actions Needed

- Choose storage vendor and region.
- Create production bucket/container.
- Create least-privilege service credentials.
- Provide encryption and signed URL policy.
- Approve and run provider metadata migration.

## Implementation Tasks

- Add provider abstraction.
- Add local provider.
- Add cloud placeholder provider.
- Add access policy tests.
- Document production setup and rollback.
