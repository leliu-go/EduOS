# EduOS Day 5 Summary

Date: 2026-05-21

## Scope

Day 5 focused on full-link QA rather than adding an isolated module. The run covered Admin/academic/finance, teacher, and student surfaces using the `qa-*` golden-path tenant data.

## Flows Covered

- Admin/academic/finance: students, teachers, course products, class groups, enrollments, scheduling, resources, homework, course accounts, course consumption, payments, finance reports, version settings.
- Teacher: dashboard, schedule, class list, homework/corrections, teaching resources, account page, and finance denial.
- Student: learning home, schedule, homework, mistakes, authorized resources, reports, account page, and admin/teacher/finance denial.
- Finance: payment ledger, finance report, refund request entry, refund approval panel, and resource-management denial.
- Cross-portal consistency: QA seed links one tenant, one class, one teacher, one student, one parent, schedules, homework, resource permission, word check-in activity, payment, course account, course consumption, and refund records.

## Fully Passing

- `scripts/seed-golden-path.ts` creates repeatable local QA data with explicit opt-in and production guard.
- `tests/e2e/golden-path.spec.ts` passes for Admin, teacher, student, and finance roles.
- Student resource download now goes through a server-authorized `/download` route before signed URL generation.
- Finance payment page now exposes a real refund request dialog and a pending refund approval panel.
- Prisma `Decimal` objects found during E2E were removed from client component props by converting query results to plain DTOs.

## Not Fully Product-Complete

- The golden path verifies page health and core permission surfaces; it does not yet submit every form end-to-end through the UI.
- Guided order creation, renewal, refund approval policy, and class/lesson deep workflow remain future product work.
- Teacher lesson execution is still split across resources, homework, feedback, and attendance pages.
- Student course detail and activity history need richer dedicated pages.

## Bugs Fixed

- P0: Student resource detail previously allowed legacy `fileUrl` to be exposed directly. It now only opens resources through server-side authorization when `objectKey` exists.
- P1: Finance refund action existed but had no usable UI entry. Added refund request and approval UI on the payment ledger page.
- P1: Client components received Prisma `Decimal` or full database objects from resource, schedule, payment, class, course, and homework queries. Added minimal DTO mapping.
- P1: Resource release label was exported from a client component and called by server pages. Moved the formatter into a server-safe utility.

## Test Results

- `pnpm typecheck`: passed.
- `pnpm lint`: passed.
- `pnpm test`: 99 files passed, 385 tests passed.
- `EDUOS_RUN_GOLDEN_PATH_E2E=true pnpm test:e2e -- golden-path.spec.ts --workers=1`: 4 tests passed.
- Remaining runtime note: Playwright logs `NO_COLOR`/`FORCE_COLOR` warnings and pg logs a deprecation warning about concurrent `client.query()` usage. These do not block Day 5 but are recorded in tech debt.

## Migration And Production

- No database migration was added.
- No real production migration was executed.
- No ECS deployment, production RDS mutation, OSS deletion, real payment provider, SMS, WeChat, or Alipay integration was executed.
- `.env.production.local` was not read, printed, or committed.

## Commit Status

- Day 5 changes are intended to be committed after verification.
- `EduOS_Codex_Overnight_Run_Pack_v2/` and generated `next-env.d.ts` churn must remain uncommitted.
