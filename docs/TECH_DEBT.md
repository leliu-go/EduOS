# EduOS Technical Debt

## Productization Follow-Ups

### Cloud Resource Provider

- Aliyun OSS provider code now exists, but live OSS smoke testing still requires a human-provisioned private bucket and RAM credentials.
- Move from `prisma db push` local schema sync to a reviewed migration workflow before production rollout.
- Add full upload UI/API flow after storage metadata is confirmed in the target database.
- Add provider-specific retry, timeout, object overwrite, and large-file tests before high-volume production use.

### Parent Resource Authorization

- Parent file access now requires explicit guardian user scope in the resource policy helper.
- Persisted resource assignment queries should still enforce concrete guardian/student joins in database-backed download endpoints.

### MFA/TOTP

- Add encrypted secret persistence after KMS or key lifecycle approval.
- Hash backup codes with a production pepper.
- Add rate limiting, lockout, recovery, and audit logs.
- Add e2e coverage for enrollment, challenge, recovery, and disable flows.

### Activity Engine

- Add tenant-scoped `Activity`, `ActivityAssignment`, and `ActivityCheckIn`
  models after migration approval.
- Add audit logs for publish, pause, end, assignment, and check-in mutations.
- Add reporting aggregation after query/index review.
- Build UI flows only after persistence and authorization queries are settled.

### Release Operations

- Decide production hosting and deployment channel.
- Define release tags and artifact retention.
- Define update manifest publication process.
- Add production smoke tests and rollback drills.

### Windows Packaging

- Continue with PWA first.
- Revisit Tauri only if native shell requirements appear.
- Do not implement code signing or desktop auto-update without human approval.

### Test/Runtime Warnings

- E2E currently passes, but logs show a `pg` deprecation warning about calling
  `client.query()` while another query is executing. Review before upgrading to
  `pg@9`.

### Existing Dirty Worktree

- Several unrelated files were modified before this productization run and were
  intentionally left untouched. Review them separately before assuming a fully
  clean release branch.

### Day 3 Product Experience

- The workbench now exposes a placeholder for `未提交作业学生`; implement the exact assignment-vs-submission query before treating it as a real KPI.
- Finance payment entry is manual-only. Real payment providers require a separate RFC, sandbox, webhook verification, and reconciliation review.
- The refund backend exists, but Day 3 only adds an operation entry; a dedicated refund request UI still needs implementation.
- The storage status page intentionally shows only redacted environment state. Add active OSS smoke status only after staging-side scripts are approved.
- The settings security page is a safe first entry point. It still needs filterable audit logs, recent login signals, and abnormal-login detection.

### Day 4 Student/Teacher Experience

- Student and teacher "Me" pages are now present, but account security and cache clearing are informational until the PWA cache-management UI is wired.
- Activity Engine needs dedicated student and teacher mobile pages; current activity visibility is split between dashboard tasks and backend policies.
- Teacher lesson detail should be consolidated into a single teaching execution page instead of spreading attendance, resources, homework, and feedback across multiple surfaces.
- Student course detail should become a first-class page with lesson content, resources, homework, feedback, and check-in state.
- Add more Playwright e2e for mobile portal deep links, unauthorized redirects, and role switching.

### Day 5 Golden Path QA

- Golden-path E2E now covers role login, route health, basic permissions, finance/refund entry points, and student resource download authorization. It still needs full form-submission coverage for each business mutation.
- Several client components previously accepted full Prisma payloads. Day 5 fixed the observed Decimal serialization paths; keep future query results as minimal DTOs before passing them into `"use client"` components.
- The local E2E run still logs a pg deprecation warning about concurrent `client.query()` usage. Investigate before upgrading to `pg@9`.
- The seed script is intentionally additive/idempotent and does not clean data. If QA data cleanup is needed, add a guarded, prefix-only cleanup script instead of using database reset.

### Frontend Design Pass

- The new responsive E2E checks catch route health and document overflow, but they do not yet prove complete UI form-submission flows.
- Admin scheduling and resource management remain data-dense; they are acceptable for desktop but need a deeper tablet/mobile interaction design later.
- Student and teacher portals now have clearer priority panels, but dedicated activity detail and course/lesson execution pages are still future work.

### Admin Backup And MFA

- Wire the Admin backup settings buttons to full MFA step-up flows after production TOTP enrollment is approved.
- Add a real one-time challenge issuing endpoint that persists `AdminBackupDeviceChallenge` rows and consumes them after signature verification.
- Add a Tauri desktop backup client if browser storage is not reliable enough for the target backup size.
- Build a staging-only restore preview/import CLI before considering any production restore write path.
- Add Playwright coverage for MFA challenge, backup device registration, primary promotion, revoked-device denial, and encrypted backup export after a seeded MFA fixture exists.

### Security And Maintainability Review 2026-05-25

- Add an account import preview that flags existing global user matches before creating tenant memberships.
- Wire PWA cache clearing into logout/account-switch UX even though the service worker currently caches only static assets.
- Fixed 2026-05-26: duplicate login server action path was removed; active login traffic remains on `/api/auth/login`.
- Fixed 2026-05-26: parent resource policy now requires child/resource student-scope intersection when explicit student scope exists.
- Fixed 2026-05-26: account and finance CSV downloads use a shared no-store helper.
- Split `app/(dashboard)/dashboard/scheduling/page.tsx` into smaller date-control, month-grid, and schedule-list components.
- Split `features/accounts/actions.ts` into invite/import/export/lifecycle modules.
- Replace brittle source-string architecture tests with helper-level tests where possible.
- Add a reusable CSV response helper with `Cache-Control: no-store` defaults for sensitive exports.
