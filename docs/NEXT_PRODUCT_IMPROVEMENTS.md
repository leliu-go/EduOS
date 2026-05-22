# EduOS Next Product Improvements

Date: 2026-05-21

## Workbench And Analytics

- Build a true `经营分析` data center only after it can provide trends, cohorts, teacher utilization, campus comparison, conversion funnels, revenue recognition, and exports.
- Add a precise `未提交作业学生` query by comparing assignment targets against submissions.
- Split workbench cards by role defaults: finance sees reconciliation first, academic sees attendance/course consumption first, and admins see all.

## Finance

- Add order creation and renewal forms that connect Order, Enrollment, CourseAccount, and Payment in one guided flow.
- Add refund request UI on top of the existing server action.
- Add voucher upload through cloud resources, with RBAC and tenant isolation.
- Add teacher compensation and payroll reconciliation in a separate RFC.
- Add real payment providers only after sandbox credentials, webhook verification, reconciliation, and compliance review.

## Settings And Security

- Add filterable audit log UI for finance, resource permission, MFA, and settings changes.
- Add recent login and abnormal-login signals.
- Add production KMS-backed MFA secret storage after human approval.

## Version And Release

- Publish a real update manifest during staging release instead of using package version as all manifest fields.
- Add release notes UI backed by a safe, public changelog endpoint.
- Add smoke-test status cards for RDS, OSS, Nginx, HTTPS, and PM2 after staging automation is approved.

## Student And Teacher Experience

- Add a dedicated student activity page for word check-in history, streaks, and assigned activity detail.
- Add a dedicated teacher activity progress page with class completion rate and incomplete student list.
- Merge teacher lesson attendance, lesson resources, homework, classroom performance, and lesson feedback into a single teaching execution page.
- Add student course detail pages that connect lesson content, teacher feedback, resources, homework, and reminders.
- Expand e2e coverage for student/teacher deep links, cross-tenant denial, resource download authorization, homework submission, and homework grading.

## Day 5 Golden Path Follow-Ups

- Turn the golden-path E2E from page-health checks into full UI form submission for student creation, teacher creation, course product creation, class creation, enrollment, scheduling, homework submission, grading, and refund approval.
- Add a guided order/renewal wizard that connects Order, Payment, Enrollment, and CourseAccount without sending staff through separate pages.
- Add dedicated resource upload UI on top of the storage provider, including file size/type validation and cloud upload progress.
- Add student activity detail/history and teacher activity progress pages for the existing word-checkin engine.
- Add a single teacher lesson execution page that combines attendance, resources, homework, feedback, and lesson status.

## Frontend Design Follow-Ups

- Run a human UX walkthrough on 375px mobile for student homework submission, teacher correction, and resource download after seeded E2E is available.
- Add screenshot-based visual regression only after the page structure stabilizes; current responsive E2E checks route health and overflow, not pixel diffs.
- Upgrade Admin resource and scheduling pages from dense tables/calendars to split list/detail flows if real users struggle on tablet widths.
- Add student course-detail and teacher lesson-execution pages as first-class destinations instead of relying on scattered section links.
