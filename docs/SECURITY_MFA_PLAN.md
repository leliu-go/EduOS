# EduOS MFA/TOTP Security Plan

EduOS supports a low-risk first MFA layer for high-privilege accounts while
keeping production cryptography out of source control.

## Scope

- Admin, principal, academic affairs, campus admin, and finance accounts can be
  required to use MFA according to tenant policy.
- Teacher MFA can be enabled later through the `all_staff` policy mode.
- Student and parent accounts are not MFA-required by default.
- MFA is enforced after password authentication and before protected high-risk
  sessions proceed.

## Current Implementation

- `lib/mfa/mfa-policy.ts` defines role-aware policy decisions.
- `lib/auth/mfa-login.ts` maps policy decisions into login actions:
  `allow`, `enroll`, `challenge`, or `deny`.
- `lib/mfa/mfa-crypto.ts` provides a local development AES-GCM encryption
  provider and backup-code hashing helpers.
- `lib/mfa/totp.ts` generates base32 TOTP secrets, RFC 6238 codes, token
  verification, and `otpauth://totp` provisioning URIs compatible with
  Microsoft Authenticator.
- `lib/mfa/mfa-service.ts` prepares encrypted enrollment records and writes MFA
  audit events.
- `lib/mfa/mfa-recovery.ts` defines one-time hashed recovery-code consumption.
- `/mfa/setup` handles first-time Admin enrollment before dashboard access.
- `/mfa` handles post-password Authenticator challenges.
- Admin backup sync authorization requires an MFA-completed session before
  accepting a primary backup device signature.
- `UserMfaCredential` is an additive, tenant-scoped Prisma model for encrypted
  TOTP credentials.

## Secret Handling

- Real TOTP secrets must never be logged.
- Backup codes must never be stored in plaintext.
- Backup codes are hashed with a server-side pepper before persistence.
- The local encryption provider is for staging/local validation only.
- Production should use a KMS or equivalent managed key provider.

## Audit Events

MFA operations write `AuditLog` rows using these actions:

- `mfa.enrollment.started`
- `mfa.enrollment.verified`
- `mfa.challenge.failed`
- `mfa.backup_code.used`
- `mfa.disabled`

## Human Actions Before Production Enforcement

- Provision a production KMS key or managed secret encryption provider.
- Generate `MFA_BACKUP_CODE_PEPPER` and store it only on the server.
- Confirm recovery identity-check workflow for locked high-privilege accounts.
- Approve running the additive MFA migration on staging.
- Add operational telemetry for repeated MFA challenge failures.
