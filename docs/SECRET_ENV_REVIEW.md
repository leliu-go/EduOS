# Secret And Environment Review

Date: 2026-05-25

## Reviewed Files And Patterns

- `.gitignore`
- `.env.example`
- `.env.production.example`
- `lib/auth/session.ts`
- `lib/storage/aliyun-oss-provider.ts`
- `lib/mfa/mfa-crypto.ts`
- `scripts/check-production-env.ps1`
- `scripts/server/check-rds-connection.sh`
- `scripts/server/check-oss-provider.sh`
- `start-eduos.ps1`

## Findings

### P0

No real secret was confirmed in tracked source files during this pass.

### P1 - Dependency advisories

`pnpm audit` initially reported two moderate transitive advisories:

- `@hono/node-server <1.19.13`, via Prisma CLI.
- `postcss <8.5.10`, via Next's dependency tree.

Fix applied:

- Added pnpm overrides for `@hono/node-server@1.19.13` and `postcss@8.5.14`.
- Re-ran `pnpm audit`: no known vulnerabilities found.

### P2 - Local dev defaults in `start-eduos.ps1`

`start-eduos.ps1` contains local development defaults such as local database credentials and local auth secrets. They are not production secrets, but the script should remain clearly local-only and must never be copied to production as-is.

## Positive Controls

- `.env`, `.env*.local`, and local uploads/resources/cache paths are ignored.
- `.env.example` and `.env.production.example` contain placeholders only.
- Production secret checks print presence/status without printing values.
- `AUTH_SECRET` is required in production.
- OSS AccessKeySecret is read server-side only and is not included in signed URLs.

## Remaining Risks

- Add a CI secret scan that excludes prompt packs and generated files but blocks committed credentials.
- Rotate any real credential if it is ever accidentally pasted into docs, issues, or chat.

