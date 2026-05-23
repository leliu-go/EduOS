# Core Backup Export Format

Core backups use an encrypted package envelope.

```json
{
  "schemaVersion": 1,
  "appVersion": "0.1.0",
  "tenantId": "tenant_x",
  "exportedAt": "2026-05-23T10:00:00.000Z",
  "recordCounts": {
    "students": 120,
    "payments": 240
  },
  "checksum": "sha256:...",
  "encryptedPayload": "...",
  "signature": "optional-device-signature"
}
```

## Payload Rules

- `encryptedPayload` must be produced from sanitized core structured data.
- Local encryption uses AES-256-GCM with a passphrase-derived key for the first PWA-safe implementation.
- Device signature is optional in the envelope but required for server sync authorization.
- Checksum covers schema version, app version, tenant ID, export time, record counts, and encrypted payload.

## Excluded Fields

Export must remove passwords, password hashes, sessions, refresh tokens, MFA secrets, backup codes, AccessKeys, signed URLs, private keys, recovery keys, file URLs, and attachment JSON fields.
