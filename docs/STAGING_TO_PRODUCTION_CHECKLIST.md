# Staging To Production Checklist

## Before Production

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `scripts/check-release.ps1`
- [ ] Confirm `.env.production.local` is not tracked or staged.
- [ ] Review service worker cache rules.
- [ ] Review update manifest metadata.
- [ ] Review release notes and `package.json` version.
- [ ] Review Prisma migration SQL.
- [ ] Confirm database backup.
- [ ] Confirm OSS bucket remains private.
- [ ] Confirm no resource library, upload folder, or `node_modules` is packaged.

## Migration Gate

Do not run production migration unless all are true:

- migration is approved,
- backup exists,
- SQL does not contain destructive statements,
- `RUN_PRODUCTION_MIGRATIONS=true` is set intentionally,
- deployment operator records result in `docs/DEPLOYMENT_HISTORY.md`.

## After Production

- [ ] `https://eduos.study-go.top/api/version` returns 200.
- [ ] Admin login works.
- [ ] Teacher login works.
- [ ] Student login works.
- [ ] Resource download authorization works.
- [ ] Version/update UI shows expected version.
- [ ] PWA install prompt appears on HTTPS-capable browser.
