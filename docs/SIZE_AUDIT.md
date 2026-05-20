# EduOS Size Audit

Run date: 2026-05-21

## Measured Local Paths

| Path | Approx size | Classification | Productization action |
| --- | ---: | --- | --- |
| `node_modules` | 1206.53 MB | Local dependency cache | Do not bundle in installer or release artifact. Reinstall during build/deploy. |
| `.next` | 5199.88 MB | Generated local Next.js build/dev output | Do not bundle in installer. Build in deployment environment. |
| `.next/cache` | 0.37 MB | Generated cache | Exclude from source, release artifacts, and installer. |
| `.local` | 68.15 MB | Local development PostgreSQL data/logs | Exclude from source, release artifacts, installer, and backups unless explicitly requested. |
| `test-results` | 0 MB | Playwright output | Exclude from artifacts except CI diagnostics. |
| `playwright-report` | missing | Generated report | Exclude from artifacts except CI diagnostics. |
| `coverage` | missing | Generated coverage output | Exclude from product artifacts. |
| `public/uploads` | missing | Local uploaded resources | Do not bundle. Production resources must live behind storage providers. |
| `storage` | missing | Local provider storage | Do not bundle. Use only for development/cache. |
| `resources` | missing | Potential local resource library | Do not bundle. Cloud-managed metadata and provider-backed files only. |
| `EduOS_Codex_Overnight_Run_Pack_v2` | 0.04 MB | Local development instruction pack | Do not include in app releases. |

## Findings

- The large footprint is caused by development dependencies and generated build output, not EduOS source code.
- `.next` and `node_modules` are normal local development directories. They must not be confused with the production web deployment or a user install package.
- Resource payloads, word books, question banks, course videos, handouts, uploaded files, and local database files must stay out of user-facing installers.

## Productization Rule

Do not bundle database files, `node_modules`, generated Next.js caches, course resources, videos, word books, question banks, `.env` files, or local storage into any user install package.

The preferred installation model is PWA from a cloud-hosted EduOS URL. Any future Windows package is only a lightweight shell that opens the cloud app and may cache authorized resources on demand.
