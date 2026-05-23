# Local Backup Restore Runbook

RDS 自动备份/快照是第一恢复手段。Admin 本地加密备份是第二恢复手段，不能替代云数据库备份。

## Restore Flow

1. Create a new empty EduOS server.
2. Configure RDS, OSS, domain, HTTPS, and server environment variables.
3. Do not reuse old sessions, old MFA secrets, old AccessKeys, or old signed URLs.
4. Upload or select the local encrypted backup file.
5. Enter the local backup passphrase or recovery key on the trusted restore machine.
6. Verify:
   - `schemaVersion`
   - `appVersion`
   - `tenantId`
   - `checksum`
   - `recordCounts`
7. Preview the record counts to be restored.
8. Require human confirmation.
9. Import core structured records into the new database.
10. Reconfigure Admin MFA.
11. Rebind the primary backup device.
12. Reconfigure OSS credentials and storage provider settings.

## What Is Not Restored

- 作业照片
- 错题照片
- 视频/音频
- OSS 文件本体
- OSS signed URL
- 原 session
- 原 MFA secret
- 原 AccessKey
- 原 password hash if intentionally excluded by policy

明确限制：不恢复原 MFA secret，不恢复原会话，也不恢复任何旧服务器密钥。

## Current Status

This runbook is ready for supervised restore planning. Production restore writes are not automated in this phase.
