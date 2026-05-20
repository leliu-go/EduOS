# EduOS Release Notes Draft

## Productization Baseline

This release prepares EduOS for a safer MVP productization path while preserving
one multi-role application for admins, teachers, students, and parents.

## Added

- PWA manifest, service worker, and install prompt.
- Runtime version endpoint and update manifest endpoint.
- Non-disruptive update banner and version badge.
- Resource storage provider abstraction with local development provider and
  cloud placeholder.
- Productization RBAC permissions for resources, activities, MFA/security
  policy, version visibility, and update administration.
- MFA/TOTP policy helpers and safe placeholders.
- Activity Engine first-stage primitives for word check-in activities.
- PWA-first Windows installer RFC and strategy.
- Release, update, rollback, and no-deploy release check scripts.

## Security And Compliance

- Service worker avoids caching sensitive API and role-data routes.
- Students remain blocked from admin, teacher-only, finance, and internal
  operation permissions.
- Parents are scoped to guardian-bound activity/resource access.
- High-risk production actions are recorded in `docs/HUMAN_ACTIONS.md`.
- Blocked or deferred high-risk items are recorded in `docs/BLOCKERS.md`.

## Deferred

- Production cloud resource provider and credentials.
- Real MFA/TOTP provider, encryption/KMS, backup-code hashing, recovery, and
  migration.
- Activity Engine persistence models and reporting aggregation.
- Windows desktop shell, code signing, installer publishing, and auto-update
  provider.
- Production deployment, production migration, release tagging, CDN invalidation,
  forced update, and public publishing.

## Verification

Stage-level verification passed through Stage 9:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e` where applicable

Final Stage 10 verification passed:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` (89 files / 341 tests)
- `pnpm test:e2e` (72 tests)
