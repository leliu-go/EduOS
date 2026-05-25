# Admin Backup Security Review

Date: 2026-05-25

## Reviewed Files

- `lib/backup/core-data-sanitizer.ts`
- `features/admin-backup/*`
- `docs/ADMIN_BACKUP_SUMMARY.md`
- `docs/ADMIN_DISASTER_RECOVERY_PLAN.md`
- `tests/unit/core-data-backup.test.ts`
- `tests/admin-backup-ui.test.ts`

## Findings

### P0

No confirmed secret-in-backup issue was found in the sanitizer logic.

### P1 - Full browser E2E needs seeded MFA/device fixture

Admin backup security depends on Admin session, completed MFA, active `PRIMARY_BACKUP` device, device signature, tenantId, and RBAC. Static/unit tests cover the policy; full browser E2E still needs a seeded migrated database and MFA fixture.

## Positive Controls

- Core backup excludes password hashes, sessions, tokens, signed URLs, AccessKeys, private keys, recovery keys, attachment/file URL fields, photos, videos, and MFA secrets.
- The design intentionally does not use MAC address as a security boundary.
- Device private keys are not uploaded to the server by design.

## Remaining Risks

- Run a staging disaster recovery drill before relying on local backup restore.
- Add restore-preview CLI before any production restore write path.
- Keep production restore disabled unless manually approved.

