# EduOS Navigation Structure

Date: 2026-05-21

## Product Shape

EduOS remains one system with one client/PWA entry. Different roles sign in to the same system and are routed to role-appropriate experiences.

## Dashboard Shell

- `/dashboard` is the institution workbench.
- The sidebar label is `工作台`.
- The workbench focuses on today's operational actions: courses, attendance, course consumption, homework correction, renewal warnings, payment confirmation, and refunds.
- Students, parents, and teachers cannot enter the institution workbench. They use the protected mobile role shells under `/student`, `/parent`, and `/teacher`.
- 学生、家长、老师不能进入机构工作台。

## Removed Duplication

- The old duplicated `数据看板` sidebar entry is not kept because it pointed to the same `/dashboard` route as the institution home.
- We do not retain two entries with the same purpose or route.
- EduOS 不再保留重复的数据看板入口.

## Future Analytics

- `经营分析` is a future data-center concept, not the current workbench.
- It should only be added when it has distinct value: trend analysis, campus comparison, conversion funnels, teacher utilization, revenue recognition, cohort retention, exports, and management drill-downs.
- Until then, the workbench owns operational to-dos and summaries.

## Staff Areas

- 招生: CRM and renewal warnings.
- 教务: students, teachers, campus/rooms, course products, classes, scheduling, attendance, and course accounts.
- 教学: learning tasks, resources, homework.
- 财务: payment ledger, course consumption ledger, finance reports.
- 设置: accounts, academic config, system settings, version and updates.

## Role Rules

- Admin/principal roles can access the full institution workbench within their tenant.
- Academic users can access scheduling, attendance, classes, homework, and operational to-dos they are authorized to manage.
- Finance users can access finance ledgers, reconciliation, reports, and relevant finance workbench signals.
- Teachers cannot access finance, admin settings, or institution-wide internal operations.
- Students and parents cannot access teacher/admin/finance/internal allocation data.
