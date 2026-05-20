# EduOS Versioning And Updates

## Source Of Truth

`package.json` is the source of truth for the EduOS application version. Runtime endpoints and UI badges read from the same metadata through `lib/version/app-version.ts`.

## Safe Endpoints

- `/api/version`: current version, build id, and release timestamp.
- `/api/update-manifest`: latest version, minimum supported version, changelog URL, and force-update flag.

Both endpoints return public release metadata only. They must not expose database URLs, auth secrets, storage credentials, or tenant data.

## Update UX

EduOS uses a non-disruptive update banner. Users decide when to refresh so active attendance, finance, homework, or resource workflows are not interrupted.

## Future Release Flow

Production release publishing, CDN invalidation, and app-store style rollout are high-risk operational tasks. They should be executed by a human operator using the release checklist after validating staging.
