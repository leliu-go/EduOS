# Maintainability Review

Date: 2026-05-25

## Large Files Identified

Files over roughly 300 lines:

- `prisma/schema.prisma`: 1606 lines
- `scripts/seed-golden-path.ts`: 1156 lines
- `app/(dashboard)/dashboard/scheduling/page.tsx`: 719 lines
- `features/accounts/actions.ts`: 634 lines
- `features/scheduling/actions.ts`: 605 lines
- `features/homework/actions.ts`: 571 lines
- `features/homework/queries.ts`: 565 lines
- `prisma/seed.ts`: 520 lines
- `features/attendance/actions.ts`: 459 lines
- `app/(mobile)/student/page.tsx`: 434 lines
- `features/resources/queries.ts`: 427 lines
- `tests/core-business-logic.test.ts`: 413 lines
- `features/scheduling/conflicts.ts`: 398 lines
- `features/dashboard/principal-dashboard.ts`: 394 lines
- `features/mfa/actions.ts`: 356 lines
- `app/(mobile)/parent/page.tsx`: 352 lines
- `app/(dashboard)/dashboard/accounts/page.tsx`: 329 lines
- `features/resources/actions.ts`: 318 lines
- `features/classes/actions.ts`: 315 lines
- `app/(dashboard)/dashboard/page.tsx`: 306 lines
- `features/classes/class-group-form-dialog.tsx`: 302 lines

## P1 Maintainability Risks

- Scheduling page combines view switching, filtering, date navigation, month grid rendering, and list rendering in one large component.
- Account actions combine invite, import, lifecycle, export, unlock, disable, delete, and password changes.
- Homework queries/actions are large and mix multiple role scopes.
- Source-string tests protect architecture but can make refactors expensive.

## P2 Maintainability Risks

- Encoded Chinese text appears garbled in terminal output for some files. The app may render correctly, but editor/encoding consistency should be checked.
- `prisma/schema.prisma` is naturally large but can benefit from comment sections and model grouping.

## Low-Risk Refactors Done

- No broad refactor was performed. The review limited code changes to security hardening and small response-header/dependency fixes.
- 2026-05-26: removed unused duplicate login action logic from `lib/auth/actions.ts`.
- 2026-05-26: added `lib/http/csv-response.ts` and routed account/finance CSV exports through it.
