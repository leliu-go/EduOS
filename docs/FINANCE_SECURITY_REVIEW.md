# Finance Security Review

Date: 2026-05-25

## Reviewed Files

- `lib/rbac/permissions.ts`
- `features/payments/actions.ts`
- `features/refunds/actions.ts`
- `features/course-consumptions/actions.ts`
- `features/finance-reports/report.ts`
- `app/(dashboard)/dashboard/finance-reports/export/route.ts`
- `tests/finance-reports.test.ts`
- `tests/course-consumption-reversal.test.ts`

## Findings

### P1 - Finance export response needed no-store cache header

`app/(dashboard)/dashboard/finance-reports/export/route.ts` returned CSV data without `Cache-Control: no-store`. This was fixed and covered by `tests/finance-reports.test.ts`.

### P1 - Course-consumption reversal tenant predicate

The course-account restore update was changed from unique update to tenant-scoped `updateMany` with count check.

## Positive Controls

- Finance pages and actions require `finance:reports:view`, `finance:mutate`, or admin-level permissions.
- `FINANCE` role does not receive teaching mutation permissions such as homework, mistakes, or resources management.
- Payment creation validates input, scopes order lookup by tenant, uses a manual payment provider, and writes audit logs.
- Refund approval uses transactions, tenant-scoped account updates, and audit logs.
- Course-consumption reversal uses reversal metadata instead of deletion.

## Remaining Risks

- Add real integration tests for double-payment, partial-payment, refund-after-consumption, and reversal-after-refund scenarios.
- Add report reconciliation tests that compare payments, refunds, consumed revenue, and unconsumed liability from the same fixture.

