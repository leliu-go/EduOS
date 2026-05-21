# EduOS Day 3 UX Audit

Date: 2026-05-21

## Current Findings

- The sidebar has two entries that point to the same `/dashboard` route: the institution home entry and the data dashboard entry. They are effectively duplicate navigation.
- The current `/dashboard` page is closer to a monthly metrics wall than an operations workbench. It shows active students, enrollments, attendance, course consumption, liabilities, homework, and low-hour warnings, but it does not clearly answer "what needs attention today?"
- The data dashboard has no independent route or unique analysis surface. Keeping a duplicate entry would confuse users.
- Finance currently has separate pages for payment ledger, course consumption ledger, and finance reports, but the payment page is display-only and lacks the first operational step: manual payment entry.
- Course consumption already supports reversal, which is a good accounting control, but the UI needs clearer source/filter language and reconciliation framing.
- Finance reports already separate confirmed payments, refunds, estimated course-consumption revenue, and remaining course liability. The UI needs clearer language that cash received is not the same as recognized revenue.
- Version metadata exists in backend code and a version page exists under `/dashboard/version`, but the sidebar does not expose a clear version/update entry and does not display the current app version.
- The app has productization primitives for PWA, update manifests, storage providers, MFA, and Activity Engine, but it lacks a consolidated settings/status entry for operators.
- Student, parent, and teacher routes are separate mobile shells and are protected by role permissions. The admin dashboard layout remains the right place for workbench, finance, settings, and productization status.

## Direct Low-Risk Changes

- Rename the institution home concept to "工作台" and make `/dashboard` an operations workbench.
- Remove the duplicate "数据看板" sidebar entry. Defer a future "经营分析" route until it has clearly different content.
- Add today's operational signals to the dashboard query using existing tables only: today's schedules, pending attendance, pending course consumption, pending homework corrections, low-hour accounts, pending payments, and pending refunds.
- Add quick actions for common workflows: add student, schedule lesson, create homework, record payment, check warnings, and review refunds.
- Add a sidebar version badge and a clear "版本与更新" entry under settings.
- Add finance workflow docs and a manual payment provider abstraction without real payment integrations.
- Add a manual payment server action guarded by `finance:mutate`, tenant scope, validation, and audit log.
- Improve finance pages with operation buttons and empty states.
- Add a lightweight settings center plus storage/version status pages that only show redacted/safe operational state.

## RFC or Later Work

- A separate "经营分析" data center should wait until it can provide trends, cohorts, conversion, retention, teacher utilization, campus comparison, and exportable management reports.
- Real payment providers for WeChat Pay, Alipay, or bank APIs require provider review, credentials, webhook verification, reconciliation policy, and sandbox/prod separation.
- Teacher payroll, commission, and settlement reconciliation require a dedicated finance/payroll model.
- Advanced BI dashboards and drill-down charts should be built after the workbench and ledger flows are stable.
- Production MFA enforcement, KMS-backed secret lifecycle, and recovery policy still need human approval.
- Full desktop shell packaging remains RFC-only; PWA remains the low-risk client path.

## Recommended Day 3 Scope

1. Convert `/dashboard` into a role-protected institution workbench.
2. Remove duplicate dashboard navigation and document the new navigation structure.
3. Add finance manual payment entry, operation buttons, docs, and safety tests.
4. Surface version/update information in the UI with a visible settings entry.
5. Add safe settings/status entry points for storage and productization readiness.
6. Update Day 3 summary, action plan, tech debt, blockers, and human actions.

## Implemented In Day 3

- `/dashboard` now uses workbench-oriented operational to-dos.
- The sidebar no longer has a duplicated data dashboard entry.
- `版本与更新` moved into settings, and the sidebar shows the current version.
- Payment ledger now supports manual `新增收款` through a server-side action.
- Finance reports now distinguish实收、已课消收入、未消课余额、退款、欠费/应收.
- Settings, storage status, and security status pages were added with redacted/safe state only.
