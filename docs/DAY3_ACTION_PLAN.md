# EduOS Day 3 Action Plan

Date: 2026-05-21

## Goals

- Improve operator experience without deploying to production or running production migrations.
- Turn the institution dashboard into a daily workbench.
- Make finance usable for manual payment, ledger review, reconciliation, and reporting.
- Make version/update state visible in the product UI.
- Add settings/status entry points that help staging operators verify configuration safely.

## Implementation Order

1. Add source-level tests that prevent duplicate `/dashboard` navigation and require a workbench-oriented dashboard.
2. Update dashboard query and page UI to show today's work, quick actions, and real empty states.
3. Rewrite sidebar labels, remove duplicate data dashboard entry, and add version/update navigation.
4. Add finance workflow docs and a manual payment provider abstraction.
5. Add manual payment validation and server action with `finance:mutate`, tenant scope, and audit log.
6. Update finance pages with operation buttons, clearer empty states, and report language.
7. Add version/update UI controls and expose them under settings.
8. Add a small settings center and safe storage status page.
9. Update productization docs and run lint, typecheck, tests, and relevant e2e where stable.
10. Commit safe Day 3 changes and attempt push; if push fails, record recovery steps.

## Out of Scope Today

- No production migration.
- No ECS deployment.
- No live OSS object write/delete.
- No real payment provider integration.
- No WeChat, Alipay, SMS, or bank API connection.
- No desktop shell implementation.
- No separate student, teacher, or principal applications.

## Safety Rules

- Do not read, print, or commit `.env.production.local`.
- Do not commit real secrets or connection strings.
- Do not run `prisma migrate reset`, `drop database`, `truncate`, or destructive SQL.
- Only additive database changes are allowed, and only when necessary.
- All protected operations must use server-side RBAC and tenant scope.

## Execution Status

- Workbench and navigation dedupe: completed.
- Finance manual payment provider/action/UI: completed.
- Finance report clarity and course-consumption date filter: completed.
- Version/update settings UI: completed.
- Settings center, storage status, and security status entry points: completed.
- Large follow-ups moved to `docs/NEXT_PRODUCT_IMPROVEMENTS.md` and `docs/TECH_DEBT.md`.
