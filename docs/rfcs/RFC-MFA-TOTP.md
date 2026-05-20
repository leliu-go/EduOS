# RFC: MFA/TOTP Safe First Stage

Date: 2026-05-21

## Status

Safe scaffold implemented. Production secret storage, real TOTP generation,
backup code hashing, and database migration are deferred for human approval.

## Goals

- Support MFA/TOTP for high-privilege EduOS accounts in the single multi-role app.
- Keep MFA enforcement server-side and role-aware.
- Avoid storing plain-text TOTP secrets or backup codes.
- Prepare a tenant-scoped model proposal without applying an irreversible migration.
- Record all production crypto and recovery decisions before implementation.

## Non-Goals

- No real TOTP secret is generated in this stage.
- No QR provisioning URI is generated in this stage.
- No database migration is applied in this stage.
- No paid KMS, cloud secret manager, or production credential is created in this stage.
- No client-side-only MFA enforcement is accepted.

## Default Policy

`lib/mfa/mfa-policy.ts` defines the default tenant MFA policy:

- MFA enabled by default for high-privilege roles.
- Required roles: `SUPER_ADMIN`, `ORG_ADMIN`, `CAMPUS_ADMIN`, `ACADEMIC`, and `FINANCE`.
- Optional enforcement mode: `all_staff`, which also includes `TEACHER`.
- `STUDENT` and `PARENT` are not MFA-required by default.
- Tenant MFA policy administration requires both `security:policy:manage` and `security:mfa:enforce`.

## Model Proposal

The first production migration should be non-destructive and reviewed by a
human operator. The proposed credential model is:

```prisma
model UserMfaCredential {
  id                 String   @id @default(cuid())
  tenantId           String
  userId             String
  status             String
  encryptedTotpSecret String
  totpSecretKeyId    String
  backupCodeHash     String?
  lastVerifiedAt     DateTime?
  failedAttemptCount Int      @default(0)
  lockedUntil        DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

The model must include a tenant relation and a unique constraint that prevents
duplicate active MFA credentials for the same user and tenant. Backup codes must
be stored as one-way hashes with a production pepper or KMS-backed hash key.

## Security Requirements

- TOTP secrets must be encrypted before persistence.
- Encryption key identifiers must be stored with credentials for rotation.
- Backup codes must never be stored in plain text.
- MFA challenge failures, recovery approvals, disablement, and enrollment
  changes must write audit logs.
- Recovery must require an authorized staff workflow, not a self-service bypass.
- MFA tokens, backup codes, and decrypted secrets must never be logged.
- All MFA reads and writes must include `tenantId` and `userId` constraints.

## Implemented Safe Interfaces

- `defaultTenantMfaPolicy`: high-privilege MFA policy defaults.
- `roleRequiresMfa`: role-aware enforcement helper.
- `canManageTenantMfaPolicy`: server-side tenant policy permission helper.
- `canManageOwnMfa`: role permission helper for own-account MFA management.
- `evaluateMfaRequirement`: session gate helper for enrollment and verification.
- `createTotpSetupPlaceholder`: creates a setup response with no secret and no
  provisioning URI until production crypto is approved.
- `verifyTotpTokenPlaceholder`: refuses verification until a real TOTP provider
  is approved.
- `mfaCredentialModelDraft`: tenant-scoped model draft for future migration.

## Human Actions Before Production MFA

1. Choose a production encryption strategy: KMS, cloud secret manager, or an
   approved self-managed key lifecycle.
2. Generate and store `MFA_TOTP_SECRET_ENCRYPTION_KEY` or an equivalent KMS key.
3. Generate and store `MFA_BACKUP_CODE_PEPPER`.
4. Approve a non-destructive migration for MFA credentials and audit events.
5. Define support recovery identity checks and escalation rules.
6. Add end-to-end tests for enrollment, challenge, recovery, lockout, and audit
   events after the real provider is implemented.

## Rollout Plan

1. Keep placeholders enabled in development.
2. Implement encrypted TOTP provider behind the existing placeholder interface.
3. Apply reviewed migration in a staging environment.
4. Enforce MFA for `SUPER_ADMIN` and `ORG_ADMIN` first.
5. Expand to `CAMPUS_ADMIN`, `ACADEMIC`, and `FINANCE` after support recovery is
   validated.
6. Consider `all_staff` enforcement only after teacher onboarding is tested.
