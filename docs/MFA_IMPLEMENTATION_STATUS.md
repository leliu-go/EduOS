# MFA/TOTP Implementation Status

Status: low-risk first implementation complete; production enforcement pending
human-controlled crypto and staging migration approval.

## Implemented

- Role-based MFA policy for admin/principal/academic/campus/finance accounts.
- Login decision helper for post-password MFA routing.
- Local development encryption provider abstraction.
- Backup-code hashing and timing-safe verification.
- Tenant-scoped `UserMfaCredential` Prisma model.
- MFA audit-log wrapper.
- Unit coverage in `tests/unit/mfa.test.ts` and existing
  `tests/mfa-policy.test.ts`.

## Not Implemented Yet

- Real TOTP token generation and QR provisioning.
- Real KMS-backed encryption provider.
- Production MFA challenge UI.
- Recovery approval workflow.
- Production rate limiting and lockout notifications.

## Migration

Generated migration:

- `prisma/migrations/20260521001000_add_user_mfa_credentials/migration.sql`

It is additive only: creates `MfaCredentialStatus`, `UserMfaCredential`, indexes,
and foreign keys. No production migration has been executed by Codex.
