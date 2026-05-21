# Deployment Strategy

Date: 2026-05-21

## Strategy

EduOS remains one Next.js web/PWA application with multi-role login. Deployment should keep application code, database, and resource storage separate:

- Next.js app: deployed as web/PWA.
- PostgreSQL/RDS: managed database, not bundled.
- OSS: private object storage, not bundled.
- Local caches: generated and disposable.

## Artifact Boundary

Deployment artifacts must exclude:

- `node_modules`
- `.next/cache`
- local databases
- uploaded files
- course resources
- videos
- question banks
- word books
- `.env` files
- logs and test artifacts

## Preflight

```powershell
pnpm lint
pnpm typecheck
pnpm test
.\scripts\check-production-env.ps1 -Production
.\scripts\check-storage-provider.ps1
```

Run `.\scripts\check-storage-provider.ps1 -CheckEndpoint` after OSS env vars are configured.

## Production Gates

Do not deploy production until a human approves:

- production `DATABASE_URL`
- production migration plan
- OSS bucket/RAM policy
- rollback target
- release channel
- update manifest publication
