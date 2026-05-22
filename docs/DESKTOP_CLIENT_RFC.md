# RFC: Optional Tauri Desktop Client

## Status

Draft. Do not implement Tauri in the current phase.

## Product Shape

The desktop client is a lightweight shell around the cloud EduOS app:

- one Windows installer for all roles,
- same login entry,
- role routing after server-side authorization,
- no bundled database,
- no bundled backend,
- no bundled `node_modules`,
- no full resource library, video library, question bank, word book, or homework image library.

## Runtime Boundary

The Tauri shell can provide:

- desktop icon and window frame,
- local version metadata,
- local lightweight cache,
- offline drafts after a later security review,
- update check UI,
- deep links to `https://eduos.study-go.top`.

The Tauri shell must not provide:

- RDS connectivity,
- OSS master credentials,
- tenant-wide data cache,
- local finance database,
- hidden admin capability for student or teacher accounts.

## Updater Design

Tauri updater can reuse the same update manifest concept:

- `latestVersion`
- `minimumSupportedVersion`
- `releaseNotes`
- `publishedAt`
- signed installer URL
- rollback metadata

Production desktop updates require code signing and installer hosting. Those are human-approved release operations and are recorded in `docs/HUMAN_ACTIONS.md`.

## Relationship To PWA

PWA remains the first distribution model. Tauri is optional for institutions that want a native desktop window. Both connect to the same cloud backend/API and follow the same RBAC and `tenantId` checks.
