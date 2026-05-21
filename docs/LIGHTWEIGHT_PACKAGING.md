# Lightweight Packaging

Date: 2026-05-21

## Product Shape

EduOS may be installed like software through PWA or a future desktop shell, but the business system remains cloud-backed.

The package contains only:

- client entry
- app shell
- version/update check
- local cache logic
- offline draft support where implemented

The package must not contain:

- database files
- `node_modules`
- full backend runtime
- course resource libraries
- videos
- question banks
- word books
- homework photo library
- mistake photo library
- uploaded files
- `.env` files or secrets

## Runtime

The client talks to the ECS backend/API. ECS talks to RDS and OSS. The client never talks directly to RDS or holds OSS credentials.

## PWA Cache Boundary

The service worker only caches public static shell assets. It does not cache
`/`, `/api/`, role dashboards, finance data, student privacy data, admin-only
pages, signed resource URLs, or resource authorization responses.
