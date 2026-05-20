# EduOS Release Artifact Rules

## Artifact Types

### Source Repository

Contains source code, tests, Prisma schema, docs, and safe local provider code. It must not contain secrets, local database data, uploaded resources, generated browser reports, or dependency directories.

### Web Deployment Artifact

Built by the deployment environment from source. It can contain compiled application output required by the hosting platform, but it must not include `.env`, local databases, uploaded resources, course videos, word books, question banks, or raw service keys.

### User Install Package

EduOS should prefer PWA installation. If a Windows installer is later approved, it must be a lightweight shell for the cloud app. It must not include database files, the full backend, `node_modules`, `.next/cache`, resource libraries, uploaded files, videos, word books, question banks, handouts, or `.env`.

## Required Exclusions

- `node_modules`
- `.next/cache`
- `.turbo`
- `.cache`
- `.local`
- `test-results`
- `playwright-report`
- `coverage`
- `dist`
- `logs`
- `public/uploads`
- `storage`
- `resources`
- `.env`
- `.env*.local`
- local database files
- secrets or service keys

## Resource Packaging Policy

Resources are cloud-managed. The database stores metadata and permission records. Files are accessed through a storage provider after server-side RBAC and tenant checks. Local machines may only cache authorized resources on demand.

## Review Checklist

Before publishing any release artifact:

1. Confirm it is one EduOS app with multi-role login.
2. Confirm no database or resource library is bundled.
3. Confirm no `.env` or secret file is present.
4. Confirm service-worker caching excludes sensitive APIs and role data.
5. Confirm release notes and rollback plan are attached.
