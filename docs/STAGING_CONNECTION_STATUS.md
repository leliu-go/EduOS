# Staging Connection Status

Date: 2026-05-21

## Known From Human Supervision

- ECS Ubuntu 22.04 is purchased and configured.
- RDS PostgreSQL is purchased and configured.
- Database `eduos` exists.
- Account `eduos_app` exists.
- RDS whitelist includes ECS private IP.
- ECS has `/opt/eduos/.env.production.local`.
- Domain `eduos.study-go.top` resolves to ECS.
- `http://eduos.study-go.top` is reachable.
- OSS bucket `eduos-prod-resources-studygo` exists in `oss-cn-beijing`.
- OSS bucket is private with public access blocked.
- RAM user and OSS AccessKey exist on ECS env.

## Verified By Codex Locally

- GitHub push currently unavailable from this environment.
- Recovery artifacts were generated locally.
- Local code quality gates passed after Day 2 continuation:
  - `pnpm lint`: passed.
  - `pnpm typecheck`: passed.
  - `pnpm test`: passed, 95 files and 373 tests.
  - `pnpm test:e2e tests/e2e/permissions.spec.ts tests/e2e/activity-word-checkin.spec.ts`: passed, 5 tests.
- Prisma schema validation passed after MFA and Activity Engine additive models.
- Migration SQL scans found no `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, unsafe `DELETE FROM`, or `migrate reset` patterns in the newly generated Day 2 migrations.

## Not Verified By Codex

- SSH to ECS was not attempted because no SSH target/key was provided.
- RDS live connection from ECS was not executed.
- OSS live upload/read/signed URL smoke test was not executed.
- ECS-side OSS smoke command has been prepared in `docs/ALIYUN_OSS_SMOKE_TEST.md`.
- Nginx config on ECS was not inspected.
- HTTPS status was not verified; only the user-reported HTTP status is known.
- Staging baseline, MFA, and Activity Engine migrations were generated locally but not executed against RDS.

## Current Staging Status Summary

| Component | Status |
| --- | --- |
| ECS | Human-reported ready; Codex generated bootstrap/deploy/check scripts. |
| RDS | Human-reported database and account ready; Codex did not run production migration. |
| OSS | Human-reported private bucket and ECS env ready; Codex generated safe `test/` smoke scripts. |
| Nginx | Config template generated; live ECS config not inspected by Codex. |
| HTTP | Human-reported reachable at `http://eduos.study-go.top`. |
| HTTPS | Not verified by Codex; certificate/TLS status requires human/ECS check. |
