# Admin Backup Device Security

Admin backup devices are not the same as Admin login sessions. A computer can log in as Admin and still be unable to sync local backups.

## Device Roles

| Role | Meaning |
| --- | --- |
| `LOGIN_ONLY` | Default registered Admin device. It can log in but cannot sync core backups. |
| `BACKUP_AUTHORIZED` | Reserved authorization level for future non-primary backup workflows. |
| `PRIMARY_BACKUP` | The only device role allowed to sync core structured data in phase 1. |
| `STANDBY_BACKUP` | Reserved for future standby support; disabled by default. |

## Device Status

| Status | Sync Allowed |
| --- | --- |
| `ACTIVE` | Only if role and all sync checks pass. |
| `REVOKED` | No. |
| `LOST` | No. |
| `REPLACED` | No. |

## Sync Gate

Core backup sync must pass every check:

1. Admin session exists.
2. Session has completed MFA.
3. User role is `SUPER_ADMIN` or `ORG_ADMIN`.
4. Tenant backup policy is enabled.
5. Device is registered in the same `tenantId`.
6. Device status is `ACTIVE`.
7. Device role is `PRIMARY_BACKUP`.
8. Short-lived challenge is valid and not reused.
9. Device private key signature verifies against the stored public key.
10. Auto sync interval is not too frequent.

## Not MAC Binding

This feature does not use MAC address. It uses device private key signature and server-side policy. The server stores only the public key and `sha256:` public-key fingerprint.

中文说明：不使用 MAC 地址，不读取 MAC 地址，也不把 MAC 地址写入数据库。

## Audit

Register, promote, revoke, mark lost, replace, sync, export, and restore-preview events must write tenant-scoped audit logs. Device private keys, TOTP secrets, recovery keys, and backup passphrases must never be logged.
