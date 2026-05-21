# Stage 4 Cloud Resource Summary

Date: 2026-05-21

## Completed

- Added `lib/storage/StorageProvider.ts`.
- Added `lib/storage/local-provider.ts`.
- Added `lib/storage/aliyun-oss-provider.ts`.
- Added `lib/storage/index.ts`.
- Added `lib/env/production-env.ts`.
- Kept legacy `lib/resources/*storage-provider*` imports working through wrappers.
- Added server-side authorized download helper in `lib/resources/download-authorization.ts`.
- Tightened parent resource authorization so parent actors must be explicitly listed as bound guardians.
- Added additive `Resource` storage metadata in Prisma schema.
- Added `.env.production.example`.
- Added no-secret environment and storage check scripts.
- Added cloud resource, Aliyun, production environment, deployment, and Stage 4 summary docs.

## Real Integration Code

- Aliyun OSS signed URL generation using HMAC-SHA1 query signatures.
- Aliyun OSS `PUT` upload through injectable `fetch` transport.
- Environment loading from `RESOURCE_STORAGE_PROVIDER` and `ALIYUN_OSS_*` variables.
- Local provider writes payloads under ignored local storage paths.
- Authorization helper signs URLs only after tenant and role checks pass.

## Human Actions Still Needed

- Create the private OSS bucket.
- Create least-privilege RAM credentials.
- Configure production environment variables outside git.
- Approve production migration process and backup plan.
- Run endpoint smoke test with real OSS environment variables.
- Configure RDS and run read-only DB smoke checks before production deployment.

## Migration

No Prisma migration file was created because this repository currently has no `prisma/migrations` history. The change was additive, and the local development database was synchronized with:

```powershell
pnpm prisma db push
```

No destructive migration, reset, drop, data wipe, or production migration was executed.

## Verification

- `.\scripts\check-production-env.ps1`: passed with local provider, no secrets printed.
- `.\scripts\check-storage-provider.ps1`: passed with local provider, no secrets printed.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed, 92 files and 353 tests.
- `pnpm test:e2e tests/e2e/mobile-resources.spec.ts tests/e2e/auth.spec.ts`: passed, 51 tests.

## Remaining Risks

- Real Aliyun OSS variables were not present, so live OSS upload/download smoke tests were not run.
- A private OSS bucket and least-privilege RAM credentials still require human console setup.
- Production migration workflow still needs human review because this repo does not currently have Prisma migration history.
- Existing Playwright run emitted a non-blocking `pg@9` deprecation warning about concurrent `client.query()` calls.
