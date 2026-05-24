# EduOS Versioning

## Source Of Truth

`package.json` is the source of truth for the EduOS application version. Runtime endpoints and UI badges read from the same metadata through `lib/version/app-version.ts`.

## Safe Endpoint

- `/api/version`: current version, build id, build time, short commit hash, and release timestamp.

The endpoint returns public release metadata only. It must not expose database URLs, auth secrets, storage credentials, tenant data, or `.env` contents.

The short commit hash is read from build-time public metadata such as `NEXT_PUBLIC_COMMIT_SHA`, `GIT_COMMIT_SHA`, or provider-specific commit variables. Secrets and connection strings are never included.

## Current Update Model

Current EduOS deployment is server-managed:

1. Admin/operator merges code to `main`.
2. The ECS server runs `git pull`, installs/builds as needed, and restarts PM2.
3. Users refresh or reopen the PWA and receive the latest server-rendered UI.

Because the server is the single deployed app, the UI now shows version information only. It does not expose a manual "检查更新" button.

## UI Locations

- Sidebar bottom shows the current version as `v{package.json version}`.
- Settings navigation includes `版本信息` at `/dashboard/settings/version`.
- The version page shows current version, build id, build time, short commit hash, and release time.
- The older `/dashboard/version` route redirects to `/dashboard/settings/version` to avoid duplicate version pages.

## Future Client Updater

If EduOS later ships a Tauri desktop shell or a separately distributed installer, the update manifest can be reintroduced as a client updater contract. That work must include code signing, rollback, installer hosting, and a human-approved release process.
