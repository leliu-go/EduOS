# MFA Recovery Policy

MFA recovery for high-privilege EduOS accounts must be as strict as MFA itself.

## Rules

- Authenticator is user-level, not computer-level.
- Admin login on any computer requires MFA.
- Backup device registration, promotion, revocation, sync, export, and restore require MFA step-up.
- Recovery codes must be hashed, one-time use, and finite.
- Recovery code plaintext must be shown only once at enrollment and never logged.
- Using a recovery code should remove that code from the stored hash set.
- MFA reset requires Super Admin or approved recovery process. It must not be a simple bypass.
- MFA reset and recovery events must write audit logs.

## Lost Phone Flow

1. Admin attempts MFA recovery.
2. Admin provides a one-time recovery code or requests Super Admin approval.
3. Server verifies the hash and consumes the code.
4. Admin is prompted to re-enroll Authenticator.
5. Old credentials are disabled after audit logging.

## Production Prerequisites

- Production `MFA_BACKUP_CODE_PEPPER` stored only on the server.
- KMS or managed encryption provider for TOTP secrets.
- Rate limiting and lockout on MFA challenge endpoints.
