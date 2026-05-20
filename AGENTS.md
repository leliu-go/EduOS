# AGENTS.md

## Project

This repository is building EduOS, a responsive web/PWA system for local academic tutoring institutions.

EduOS is not just a scheduling tool. It is an education operation and learning management system covering:

- admissions CRM
- student and guardian management
- teacher management
- courses and classes
- scheduling
- attendance and student check-in
- course consumption
- teaching resources
- homework
- mistake notebook
- learning reports
- finance and compliance
- role-based dashboards

## Product Roles

The system serves:

- Institution super admin
- Organization admin
- Campus manager
- Academic affairs staff
- Finance staff
- Teacher
- Student
- Parent/guardian

## Core Product Principles

1. Student users must never see admin, teacher-only, finance, classroom allocation, or internal operation data.
2. Parent users only see data for students bound to them as guardians.
3. Teacher users only see their own schedules, classes, students, homework, teaching resources, feedback, and mistake data related to their classes.
4. Academic affairs users manage scheduling, classes, attendance, and course consumption.
5. Finance users manage orders, payments, refunds, contracts, invoices, and financial reports.
6. Organization admins see all campus data within their tenant.
7. Every business query must be tenant-scoped.
8. Never hard-code a single institution, campus, teacher, student, or class.
9. The app must support multi-tenant structure from the beginning.
10. Compliance rules must be configurable, not hard-coded only in UI.

## Technical Stack

Use this stack unless explicitly instructed otherwise:

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Prisma ORM
- Zod validation
- Vitest
- Playwright
- pnpm

## Coding Rules

1. Use TypeScript strict mode.
2. Do not use `any` unless there is a written reason in a nearby code comment.
3. Do not add production dependencies without explaining why.
4. Do not change the chosen stack without approval.
5. Do not create mock-only features as final implementation.
6. Use server-side authorization checks for all protected actions.
7. Never rely only on client-side hiding for permissions.
8. Keep files small and feature-oriented.
9. Use clear domain names:
   - student
   - guardian
   - teacher
   - campus
   - room
   - subject
   - grade
   - courseProduct
   - classGroup
   - lesson
   - schedule
   - attendance
   - checkIn
   - courseConsumption
   - homework
   - submission
   - correction
   - mistake
   - knowledgePoint
10. All forms must use validation schemas.
11. All mutations must validate input on the server.
12. Business-critical mutations must write audit logs.
13. Destructive actions need confirmation UI.
14. Use transactions for enrollment, scheduling, attendance, course consumption, payment, refund, and transfer operations.
15. Do not refactor unrelated modules during a task.

## UI Rules

1. UI must be modern, clean, responsive, and suitable for a SaaS education dashboard.
2. Desktop dashboard should use left sidebar + topbar.
3. Mobile student/teacher/parent pages should use card layout and bottom navigation.
4. Use shadcn/ui components where possible.
5. Every page must include loading, empty, and error states.
6. Tables must support search, filter, pagination, and row actions where needed.
7. Cards must use consistent spacing, rounded corners, subtle borders, and clear hierarchy.
8. Avoid cluttered legacy ERP style.
9. Important actions must be visible but not visually noisy.
10. Chinese UI copy must be concise and professional.
11. Do not use random colors per page. Use one consistent design system.

## Security Rules

1. Passwords must never be stored in plain text.
2. Never expose service keys to client components.
3. Never expose private student information across tenants or roles.
4. Use tenantId checks in server-side code.
5. Validate all inputs on the server.
6. Protect finance and contract routes with strict role checks.
7. Protect student minor data. Only authorized guardians and staff can view it.
8. Audit finance, refund, attendance changes, course consumption changes, role changes, and enrollment changes.
9. Do not show classroom occupancy or internal schedule allocation to students.

## Testing Rules

Before completing a task, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

If the feature has a user flow, add Playwright tests and run:

```bash
pnpm test:e2e
```

If a command fails, fix the issue before moving on. If the failure is unrelated and cannot be fixed in the current task, document it clearly.

## Review Rules

Before considering a task complete:

1. Summarize changed files.
2. Explain key implementation decisions.
3. List tests added or updated.
4. List commands run and results.
5. List risks or unfinished items.
6. Run self-review against docs/REVIEW_CHECKLIST.md.
7. Fix all P0/P1 review findings before moving to the next task.
8. Commit and push the completed task to the configured git remote before ending the task.

## Git Rules

1. Use `main` as the default branch unless the user asks for another branch.
2. After each task passes lint, typecheck, test, and self-review, create a git commit.
3. Push commits to `origin` before ending the task.
4. If push is blocked by authentication, network, or remote state, report the exact blocker and do not claim the task is pushed.

## Scope Control

For each assigned task:

1. Implement only the requested task ID.
2. Do not build future modules early.
3. Do not redesign unrelated pages.
4. Do not refactor unrelated code unless necessary.
5. If a dependency or architecture decision is needed, explain options and choose the lowest-risk path.

## Current MVP Priority

Build the first demonstrable MVP in this order:

1. Project setup
2. UI system and layouts
3. Database and multi-tenant foundations
4. Auth and RBAC
5. Student and teacher management
6. Course and class management
7. Scheduling
8. Attendance, check-in, and course consumption
9. Resources
10. Homework
11. Mistake notebook
12. Reports and dashboards

## Productization Principles

1. EduOS must remain one application with role-based access. Do not split it into separate principal, teacher, student, or parent apps.
2. Use the same login entry. Route users to different dashboards after server-side role checks.
3. Cloud-hosted Web/PWA is the first distribution model.
4. A Windows installer, if implemented later, must be a lightweight desktop shell and must not bundle database, full backend, node_modules, or resources.
5. Resources must be cloud-managed through storage provider abstraction. Local machines only cache authorized resources.
6. Code must stay maintainable: no god components, god services, giant utils, unnecessary abstractions, or unrelated refactors.

## Overnight Continue Rules

1. Automatically continue low-risk tasks.
2. For destructive migrations, real secrets, paid cloud services, production deployment, code signing, or irreversible actions: do not execute the risky action.
3. For high-risk items, create RFCs, provider interfaces, local providers, `.env.example`, setup guides, and `docs/HUMAN_ACTIONS.md`, then continue.
4. Do not pause just because a task requires a future human decision.
5. Stop only if repository integrity is at risk, the project root is unclear, continuing would weaken security, or the same quality gate fails 3 times and blocks most later work.

## Distribution Rules

Do not include in release artifacts or installers:

- `node_modules/`
- `.next/cache/`
- `test-results/`
- `playwright-report/`
- `coverage/`
- local database files
- uploaded resources
- videos, word books, question banks, handouts
- `.env` files
- secrets or service keys

## PWA Cache Rules

Service worker must not cache auth tokens, sessions, finance data, student private data, admin-only responses, teacher-only responses, or full resource libraries.

## Cloud Resource Rules

1. Store metadata in DB.
2. Store files through provider abstraction.
3. Use local provider only for development.
4. Create signed URLs only after server-side permission checks.
5. Never expose cloud storage keys to client.

## MFA Rules

1. SUPER_ADMIN must require MFA.
2. ORG_ADMIN/principal and FINANCE should support forced MFA by tenant policy.
3. TOTP secrets must be encrypted.
4. Backup codes must be hashed.
5. MFA events must be audited.
6. Do not log TOTP codes or secrets.

## Activity Rules

1. Admin/principal can create and publish activities.
2. Students only see assigned published activities.
3. Teachers only see own class activities.
4. Activity resources must pass resource permission checks.
5. Publish/pause/end/assignment changes must be audited.
