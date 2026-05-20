# EduOS Technical Debt

## Productization Follow-Ups

### Cloud Resource Provider

- Choose a cloud storage vendor.
- Provision bucket/container and least-privilege credentials.
- Implement a production `ResourceStorageProvider`.
- Add signed URL expiry tests and provider-specific failure tests.

### Parent Resource Authorization

- Tighten parent resource access around concrete guardian relations once
  persisted resource assignments are modeled.
- Avoid relying only on precomputed child-scope arrays when the database can
  enforce guardian/student relations directly.

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
