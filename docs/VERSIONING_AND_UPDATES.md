# EduOS Versioning And Updates

## Source Of Truth

`package.json` is the source of truth for the EduOS application version. Runtime endpoints and UI badges read from the same metadata through `lib/version/app-version.ts`.

## Safe Endpoints

- `/api/version`: current version, build id, build time, short commit hash, and release timestamp.
- `/api/update-manifest`: latest version, minimum supported version, changelog URL, and force-update flag.

Both endpoints return public release metadata only. They must not expose database URLs, auth secrets, storage credentials, or tenant data.

The short commit hash is read from build-time public metadata such as
`NEXT_PUBLIC_COMMIT_SHA`, `GIT_COMMIT_SHA`, or provider-specific commit
variables. Secrets and connection strings are never included.

## Update UX

EduOS uses a non-disruptive update banner. Users decide when to refresh so active attendance, finance, homework, or resource workflows are not interrupted.

## Day 3 UI Locations

- Sidebar bottom shows the current version as `v{package.json version}`.
- Settings navigation includes `版本与更新` at `/dashboard/settings/version`.
- The version page shows current version, build id, build time, short commit hash, release time, update manifest fields, and a manual `检查更新` button.
- When a newer manifest is detected, users can choose `稍后` or `立即刷新`; EduOS does not force-refresh active forms.
- The older `/dashboard/version` route now redirects to `/dashboard/settings/version` to avoid duplicate version pages.

## Future Release Flow

Production release publishing, CDN invalidation, and app-store style rollout are high-risk operational tasks. They should be executed by a human operator using the release checklist after validating staging.
