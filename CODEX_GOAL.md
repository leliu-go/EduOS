# CODEX_GOAL.md

This file is the durable objective for Codex `/goal`.

## Goal Summary

Build EduOS, a modern responsive web/PWA for local academic tutoring institutions.

The MVP must support:

- role-based authentication
- multi-tenant data isolation
- student, guardian, teacher, campus, and classroom management
- course product and class management
- enrollment and course accounts
- scheduling with conflict detection
- teacher attendance and student check-in
- automatic course consumption
- course resources
- homework submission and correction
- mistake notebook
- basic learning reports
- basic finance and compliance foundations
- modern desktop dashboard and mobile student/teacher/parent pages

## How to Work

Codex must work task by task using `docs/CODEX_TASKS.md`.

Do not attempt to implement the whole app in one pass.

Use this loop:

1. Read `AGENTS.md`.
2. Read this file.
3. Read the next incomplete task in `docs/CODEX_TASKS.md`.
4. Implement only that task.
5. Run validation commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

6. If the task has user flows, also run:

```bash
pnpm test:e2e
```

7. Review against `docs/REVIEW_CHECKLIST.md`.
8. Fix P0/P1 issues.
9. Commit-ready summary.
10. Move to the next task only after the current task passes.

## Initial Goal Command

Paste this into Codex CLI from the project root:

```txt
/goal 阅读根目录 AGENTS.md、CODEX_GOAL.md，以及 docs/CODEX_TASKS.md、docs/REVIEW_CHECKLIST.md、docs/UI_SPEC.md、docs/DATABASE_SPEC.md。从 T00 开始按任务编号开发 EduOS，不要跳任务，不要越界开发；每完成一个任务必须运行 lint、typecheck、test，并按 REVIEW_CHECKLIST 做自审，只有通过后才进入下一个任务。
```

## First MVP Target

The first demonstrable MVP should finish these tasks first:

```txt
T00 Project initialization
T01 Codex project constraints
T02 UI foundation
T03 App layouts
T04 Dashboard demo
T05 Prisma initialization
T06 Multi-tenant models
T07 Auth system
T08 RBAC permission system
T09 Route protection
T10 Audit log foundation
T11 Student management
T12 Guardian relationship management
T13 Teacher management
T14 Campus and classroom management
T16 Subject and grade configuration
T17 Course product management
T18 Class group management
T19 Enrollment flow
T20 Course account foundation
T21 Schedule data model
T22 Scheduling calendar UI
T23 Single scheduling flow
T25 Conflict detection
T28 Attendance model
T29 Teacher attendance flow
T30 Student check-in flow
T32 Automatic course consumption
T33 Course consumption ledger
```

After that, continue:

```txt
T35 Resource model
T36 Resource library UI
T37 Resource permission
T40 Homework model
T41 Teacher assigns homework
T42 Student submits homework
T43 Teacher corrects homework
T47 Knowledge point model
T49 Error record model
T51 Student mistake notebook
T55 Teacher lesson feedback
T56 Student learning report
T58 Principal dashboard
```

## Definition of Done

A task is done only when:

- Implementation matches task scope.
- Server-side authorization is implemented.
- Tenant isolation is enforced.
- Validation schemas exist for mutations.
- UI has loading, empty, and error states.
- Tests are added where applicable.
- `pnpm lint` passes.
- `pnpm typecheck` passes.
- `pnpm test` passes.
- P0/P1 review findings are fixed.
- Changed files and risks are summarized.

## Prohibited Behavior

Do not:

- let students access teacher/admin/finance pages
- expose all classroom schedules to students
- expose financial reports to teachers/students/parents
- skip server-side authorization
- hard-code one school or tenant
- create demo-only business logic in production paths
- implement AI features before core flows are stable
- add new dependencies without justification
- refactor unrelated code while completing a task
- proceed when tests fail without documenting the reason

## UI Goal

EduOS should feel like a modern SaaS product, not an old ERP.

Desktop should have:

- left sidebar
- topbar
- global search
- campus switcher
- notification icon
- clean dashboard cards
- table pages with filters
- calendar-style scheduling

Mobile should have:

- compact cards
- bottom navigation
- clear daily tasks
- fewer tables
- large tap targets

Chinese UI should be clean and professional.

## Business Goal

The system must support four key operational loops first:

1. Scheduling loop:
   class -> schedule -> conflict detection -> calendar -> notification
2. Attendance and course consumption loop:
   lesson -> attendance/check-in -> automatic deduction -> ledger
3. Homework loop:
   teacher assigns -> student submits -> teacher corrects -> student revises
4. Mistake loop:
   wrong question -> knowledge point -> cause tag -> correction -> mastered

Do not overbuild CRM or AI before these loops work.
