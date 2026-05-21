# EduOS Day 2 Summary

Date: 2026-05-21

## Completed

- Retried GitHub push and generated fallback patch, bundle, and source archive artifacts when the network stayed unavailable.
- Clarified Option C architecture across deployment, cloud resource, environment, packaging, and staging docs.
- Added Ubuntu 22.04 staging scripts for bootstrap, deploy, PM2, Nginx, RDS check, OSS check, OSS smoke, and HTTP smoke.
- Generated Prisma migrations for baseline review, MFA credentials, and Activity Engine persistence.
- Added Aliyun OSS endpoint split support for internal/public endpoints while keeping `ALIYUN_OSS_ENDPOINT` compatibility.
- Strengthened RBAC/resource permission tests and docs.
- Added MFA local encryption, backup-code hashing, audit wrapper, login decision helper, schema, migration, tests, and docs.
- Added Activity Engine WORD_CHECKIN schema, migration, engine helpers, server action skeletons, tests, and docs.
- Extended version metadata with build time and short commit hash.
- Tightened PWA service worker caching to public static shell assets only.
- Added Windows installer RFC only; no desktop shell was implemented.
- Strengthened release, rollback, update manifest docs and release safety script.

## Verification

- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed, 95 files and 373 tests.
- `pnpm test:e2e tests/e2e/permissions.spec.ts tests/e2e/activity-word-checkin.spec.ts`: passed, 5 tests.
- `scripts/check-release.ps1`: passed.
- `pnpm prisma validate`: passed.

## Not Executed

- No real secrets were read, printed, or committed.
- No `.env.production.local` was committed.
- No staging or production migration was executed.
- No database drop/reset/truncate/delete was executed.
- No OSS object outside `test/` was touched.
- No SSH command was run because no SSH target/key was provided.
- No code signing, installer build, production deploy, or paid cloud console operation was executed by Codex.

## Human Next Actions

- Run the ECS-side RDS/OSS/HTTP smoke commands from `docs/ALIYUN_OSS_SMOKE_TEST.md`.
- Review migration SQL in `docs/STAGING_DEPLOYMENT_CHECKLIST.md`.
- Approve when to run `RUN_PRODUCTION_MIGRATIONS=true` on staging.
- Configure HTTPS/TLS for `eduos.study-go.top` if not already complete.
- Retry GitHub push or use `docs/GITHUB_PUSH_RECOVERY.md` fallback artifacts.
