# Admin Multi-Device Login Policy

EduOS allows an Admin account to log in from multiple computers, but local core-data backup is separated from ordinary login.

## Rules

- Admin can log in from multiple computers.
- Every Admin login must complete password authentication and MFA before high-privilege work.
- Authenticator is bound to the Admin user account, not to a computer.
- Each high-privilege Admin must use their own Admin account and their own Authenticator. Shared Admin accounts are not allowed.
- Ordinary Admin login devices are `LOGIN_ONLY` and cannot sync local backups.
- Only server-authorized `BACKUP_AUTHORIZED` or `PRIMARY_BACKUP` devices can sync core structured data.
- Default policy allows one active `PRIMARY_BACKUP` device per tenant.
- `STANDBY_BACKUP` is reserved for a future policy but is disabled by default.
- Backup capability is decided server-side by tenant policy, RBAC, MFA state, device status, and device signature verification.
- Admin or Super Admin can revoke a backup device after MFA step-up.
- Revoked, lost, or replaced devices cannot continue sync.

## MFA Meaning

MFA proves the Admin user is present. It does not prove which computer is being used. Device authorization is a separate device-key binding.

## Device Meaning

EduOS does not use MAC address as a device lock. Browsers and PWAs cannot reliably read a real MAC address, and MAC addresses can be spoofed. EduOS uses a device key pair:

- Private key stays on the local device.
- Public key and fingerprint are stored on the server.
- Server issues short-lived one-time challenges.
- The device signs the challenge with its private key.

## Recovery

If an Admin loses their phone, recovery uses one-time hashed backup codes or a Super Admin/recovery process. MFA must not be bypassed by a simple support toggle.
