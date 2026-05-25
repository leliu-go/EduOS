# Code Duplication Audit

Date: 2026-05-25

## P1 Duplication Risks

- `app/api/auth/login/route.ts` and `lib/auth/actions.ts`: two login paths can drift. Active login form uses `/api/auth/login`; retire or delegate the older action.
- Server action pattern repeats validation, permission check, transaction, audit log, revalidate, and redirect across finance, scheduling, attendance, resources, homework, and account modules.
- Several tests are source-string assertions. They are useful for MVP guardrails but duplicate implementation details and can become brittle.
- Status badge and empty-state variants are repeated across dashboard and mobile portals.

## P2 Duplication Risks

- Student, teacher, and parent mobile pages share layout/card primitives but still duplicate page-level data shaping.
- CSV export response headers are repeated; a tiny helper could standardize `Content-Type`, `Content-Disposition`, and `Cache-Control`.
- Tenant-scoped query patterns are repeated and could use narrowly scoped helper functions in high-risk modules.

## Low-Risk Fixes Done

- Added source guard against reintroducing forwarded-host trust in login route.
- Added source guard for tenant-scoped course-account restoration in consumption reversal.
- Added source guard for no-store finance report CSV export.
- Removed the unused duplicate login server action from `lib/auth/actions.ts`.
- Added `lib/http/csv-response.ts` so account and finance CSV downloads share no-store, `nosniff`, and filename safety defaults.

## Refactors Intentionally Not Done

- No routing restructure.
- No RBAC rewrite.
- No ORM abstraction.
- No UI framework replacement.
- No broad service extraction.
