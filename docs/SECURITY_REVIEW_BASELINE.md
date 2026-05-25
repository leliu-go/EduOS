# Security Review Baseline

Date: 2026-05-25

## Scope

Reviewed account security, Admin/MFA, RBAC, `tenantId` isolation, finance authorization, OSS resource authorization, PWA cache behavior, secret leakage risk, deployment scripts, dependency advisories, and maintainability hotspots.

## Commands Recorded

- `git status --short --branch`
- `git diff --stat`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm audit`
- `pnpm outdated`
- `pnpm why @hono/node-server`
- `pnpm why postcss`

## Initial Risk Summary

- P0: none confirmed in tracked product code during this pass.
- P1: login redirect trusted forwarded host headers; fixed in `app/api/auth/login/route.ts`.
- P1: course-consumption reversal restored account balance using a unique update without an explicit tenant predicate; fixed in `features/course-consumptions/actions.ts`.
- P1: finance CSV export did not explicitly prevent cache storage; fixed in `app/(dashboard)/dashboard/finance-reports/export/route.ts`.
- P1: dependency audit reported two moderate transitive advisories; fixed with pnpm overrides in `package.json`.
- P1/P2: large files and duplicated source-level tests remain maintainability risks.

## Safety Boundaries Observed

- No `.env.production.local` access.
- No real cloud secret access.
- No production migration.
- No drop, reset, truncate, or OSS delete.

