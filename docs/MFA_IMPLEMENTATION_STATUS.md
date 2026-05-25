# MFA/TOTP Implementation Status

Status: real Microsoft Authenticator compatible TOTP enrollment and challenge
flow implemented. Production rollout requires server-side MFA environment
variables and the existing additive migration to be present.

## Implemented

- Role-based MFA policy for admin/principal/academic/campus/finance accounts.
- Login decision helper for post-password MFA routing.
- Local development encryption provider abstraction.
- Backup-code hashing and timing-safe verification.
- Tenant-scoped `UserMfaCredential` Prisma model.
- MFA audit-log wrapper.
- TOTP secret generation, QR provisioning URI generation, and token
  verification compatible with Microsoft Authenticator.
- `/mfa/setup` first-time enrollment page.
- `/mfa` login challenge page.
- Server-side redirect from high-privilege password login to enrollment or
  challenge before dashboard access.
- Unit coverage in `tests/unit/mfa.test.ts` and existing
  `tests/mfa-policy.test.ts`.
- Additional coverage in `tests/unit/mfa-totp-real-flow.test.ts` and
  `tests/mfa-real-flow-source.test.ts`.

## Not Implemented Yet

- Real KMS-backed encryption provider.
- Recovery approval workflow.
- Operational telemetry for repeated MFA lockouts.

## Migration

Generated migration:

- `prisma/migrations/20260521001000_add_user_mfa_credentials/migration.sql`

It is additive only: creates `MfaCredentialStatus`, `UserMfaCredential`, indexes,
and foreign keys. No production migration has been executed by Codex.
