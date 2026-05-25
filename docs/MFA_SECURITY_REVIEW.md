# MFA Security Review

Date: 2026-05-25

## Reviewed Files

- `features/mfa/actions.ts`
- `lib/mfa/mfa-policy.ts`
- `lib/mfa/mfa-crypto.ts`
- `lib/auth/mfa-login.ts`
- `lib/rbac/require-permission.ts`
- `app/(auth)/mfa/page.tsx`
- `app/(auth)/mfa/setup/page.tsx`
- `app/(dashboard)/dashboard/settings/security/mfa/page.tsx`
- `tests/unit/mfa.test.ts`
- `tests/unit/mfa-totp-real-flow.test.ts`
- `tests/mfa-real-flow-source.test.ts`

## Findings

### P0

No confirmed P0 was found in tracked MFA code during this pass.

### P1 - Production key lifecycle still needs operational approval

MFA secret persistence correctly requires `MFA_TOTP_SECRET_ENCRYPTION_KEY` and `MFA_BACKUP_CODE_PEPPER`, but production key generation, rotation, KMS selection, and break-glass recovery remain human operational tasks.

### P1 - MFA recovery policy needs full e2e coverage

The code supports encrypted pending secrets, verification, rebind, challenge lockout, backup-code hashing, and audit events. Browser e2e coverage for recovery and rebind remains incomplete until a seeded MFA fixture is available.

## Positive Controls

- Admin/high-privilege roles are routed through MFA decisions in `lib/auth/mfa-login.ts` and `lib/rbac/require-permission.ts`.
- `security:mfa:manage` is intentionally allowed for setup while other protected actions require completed MFA for forced roles.
- TOTP secrets use AES-256-GCM encryption provider abstraction.
- Backup codes are hashed with HMAC and pepper.
- TOTP secrets, backup codes, and decrypted values are not logged by the reviewed code.
- MFA actions write audit logs for enrollment, challenge failures, verification, and rebind.

## Remaining Risks

- Add staging MFA fixture and Playwright coverage.
- Define recovery approval rules for lost authenticator devices.
- Move production secret storage to KMS or managed secret storage before relying on real production MFA at scale.

