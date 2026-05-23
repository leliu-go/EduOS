# Admin Disaster Recovery Plan

EduOS recovery is layered. Local Admin backup is a fallback, not the primary disaster recovery mechanism.

## Recovery Priority

1. Restore from Aliyun RDS automatic backup or snapshot.
2. If RDS restore is unavailable, use the encrypted Admin local core-data backup.
3. Reconfigure OSS, environment variables, Admin MFA, and backup devices after restoration.

## Local Backup Scope

The local Admin backup contains core structured records only:

- Students, guardians, and guardian binding records
- Teachers
- Course products and class groups
- Enrollments and course accounts
- Lessons, schedules, attendance, and course consumption records
- Orders, payments, and refunds
- Activity metadata and assignments
- Resource metadata and permissions

The local backup does not include homework photos, mistake photos, videos, audio files, question-bank attachments, word-book file bodies, OSS objects, signed URLs, sessions, password hashes, MFA secrets, backup codes, AccessKeys, database URLs, or any plaintext secret.

## Restore Boundary

Phase 1 implements package format, checksum validation, encryption helpers, and runbooks. It does not execute production restore writes automatically.

## Required Human Checks

- Confirm the target server is a new empty EduOS environment.
- Confirm RDS and OSS are configured.
- Verify backup checksum, schema version, app version, and tenant ID.
- Preview record counts before import.
- Confirm import manually.
- Reconfigure Admin MFA and backup devices after import.
