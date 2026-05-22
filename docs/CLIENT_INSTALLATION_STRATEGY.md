# EduOS Client Installation Strategy

## Decision

EduOS ships as one EduOS client entry for every role.

Phase 1 uses the cloud-hosted PWA at:

```text
https://eduos.study-go.top
```

Admin, academic affairs, finance, teachers, students, and parents open the same URL and install the same EduOS PWA. After login, the server session and role permissions route each account to its allowed portal.

Phase 2 may add an optional Tauri desktop shell. It must remain one Windows installer, not `Admin.exe`, `Teacher.exe`, and `Student.exe`.

## Why One Client Is Safe

- The client is only UI and local cache.
- The client does not contain a database password.
- The client cannot connect directly to RDS.
- The client does not hold OSS AccessKey or OSS AccessKeySecret.
- The client cannot construct private OSS URLs.
- All business data comes from the EduOS backend/API.
- The backend checks server-side RBAC, `tenantId`, and ownership before returning data.
- Frontend menu filtering is user experience only, not the security boundary.

## PWA Installation

1. Open `https://eduos.study-go.top` in Chrome or Edge.
2. Use the browser install action or EduOS install prompt.
3. Launch EduOS from the desktop/start menu.
4. Sign in with the assigned account.
5. Admin users enter the dashboard, teachers enter the teaching portal, students enter the learning portal, and parents enter the parent portal.

## Local Data Policy

The installed client may keep:

- app shell cache,
- public icons and static chunks,
- lightweight version metadata,
- offline drafts in a future approved implementation,
- authorized resource cache after server-side permission checks.

The installed client must not include:

- PostgreSQL or local business database,
- `node_modules`,
- complete resource libraries,
- videos, question banks, word books, homework image libraries,
- `.env` files,
- RDS credentials,
- OSS AccessKey or AccessKeySecret.

## User Update Flow

When a new deployment is available, EduOS shows a non-blocking update banner:

- "发现新版本，刷新后生效"
- "稍后"
- "立即刷新"

Users can also open "我的/设置 -> 版本与更新 -> 检查更新".
