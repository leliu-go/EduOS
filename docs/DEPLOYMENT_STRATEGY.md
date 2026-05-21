# EduOS Deployment Strategy

Date: 2026-05-21

## Final Architecture: Option C

EduOS is not a pure website and not a local single-machine application. The final product is:

```text
local client / PWA / optional desktop shell
  + cloud backend and API on Aliyun ECS
  + PostgreSQL on Aliyun RDS
  + private object storage on Aliyun OSS
  + local lightweight cache, offline drafts, and authorized resource downloads
```

Users experience EduOS like installed software. Accounts, permissions, synchronization, scheduling, course consumption, resource authorization, and version checks are cloud-backed.

## Responsibility Split

Local client:

- UI shell and login entry.
- PWA install experience.
- Local lightweight cache.
- Offline drafts where the workflow supports later sync.
- Authorized resource downloads after server approval.

Aliyun ECS:

- Next.js backend/API.
- Authentication and session handling.
- Server-side RBAC and tenant isolation.
- Scheduling, attendance, course consumption, homework, mistakes, activities, resource authorization, and version/update endpoints.

Aliyun RDS PostgreSQL:

- Tenant-scoped business data.
- Accounts, roles, schedules, resources metadata, homework, mistakes, activities, finance, audit logs.

Aliyun OSS:

- Homework photos.
- Mistake notebook photos.
- Handouts.
- Videos.
- Word books.
- Question-bank attachments.
- Other authorized resource payloads.

## Security Boundaries

- Local clients must never connect directly to RDS.
- Local clients must never hold OSS master keys, RAM AccessKey IDs, or AccessKey secrets.
- Resource downloads must go through ECS first for RBAC and `tenantId` checks.
- ECS returns a signed URL or a safe download endpoint only after authorization passes.
- Local cache is never the only source of truth.
- Service worker must not cache private API responses, admin-only pages, finance data, teacher-only data, student private data, or full resource libraries.

## Role Model

EduOS remains one application and one login entry. It must not be split into principal, teacher, student, and parent programs. Different accounts enter different role dashboards after server-side authorization.

## Staging Target

- Domain: `http://eduos.study-go.top`
- ECS: Ubuntu 22.04
- RDS database: `eduos`
- RDS app account: `eduos_app`
- OSS bucket: `eduos-prod-resources-studygo`
- OSS region: `oss-cn-beijing`
- OSS endpoint for first stage: `https://oss-cn-beijing.aliyuncs.com`
- OSS bucket is private with public access blocked.

## Deployment Gate

Before staging or production release:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Resource permission tests.
- Service worker cache review.
- Migration safety review.
- `.env.production.local` absent from git.
- `node_modules`, generated caches, resources, uploads, videos, question banks, word books, and local databases absent from release artifacts.
