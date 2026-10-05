# Administrator account recovery

Recovery preserves the user ID and all business/audit records. It is not a hard
delete. Only the specified tenant administrator is updated; other accounts remain
unchanged. No schema change or migration is required.

The operator-only `scripts/recover-admin-access.ts --stdin` accepts a JSON payload
with username, tenantSlug, password, temporaryMfaHours and confirmation
`RESET_ADMIN_ACCESS`. Supply passwords through protected stdin, never arguments,
source files, reports or shell history. `--inspect USERNAME` returns only account,
membership and MFA status, not secrets. Use the server's existing application
environment loader without inspecting or printing the production env file.

Recovery runs transactionally: hash password, unlock/activate the specified account
and admin membership, invalidate existing sessions via passwordChangedAt, erase old
TOTP/recovery-code material, revoke that account's backup devices, write an audit
record. Multi-tenant accounts require separate review and are refused by this tool.

An explicitly requested temporary MFA deferral can last at most 24 hours (default:
zero). The latest account/tenant-scoped recovery audit record authorizes that brief
grace period; it is not a permanent MFA policy. Login and protected server actions
both check expiry. Binding a new factor immediately ends the exemption. This does
not set mfaVerifiedAt: core backup and MFA step-up operations still require genuine
MFA verification. Recovery has no web endpoint and cannot be issued by the client.

Legacy sessions without issuedAt must sign in again after this rollout when their
account has passwordChangedAt. Weak temporary passwords should be changed promptly
in account security. Do not use repeated temporary recovery as a permanent bypass.

Verification: unit tests cover grant expiration, role/tenant/account scoping,
credential erasure, audit redaction, and old-session invalidation. Run lint,
typecheck, test and deployment build before server synchronization. No production
migration, database reset, object-storage deletion or business-data deletion.

## Validation on 2026-10-05

- pnpm lint: passed.
- pnpm typecheck: passed.
- pnpm test: 121 files, 454 tests passed.
- pnpm build: passed.
- Playwright unauthenticated dashboard/student/teacher access: 3 tests passed.
- Self-review: scoped account recovery, server-side RBAC remains unchanged, no
  password/secret in source or audit, no dependency/schema changes. Temporary
  password-only admin access is an explicitly requested risk, capped at 24 hours.
- Production account mutation and deployment must be verified separately; these
  local test results alone do not claim the live account has already changed.
