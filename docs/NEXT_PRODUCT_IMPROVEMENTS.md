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
