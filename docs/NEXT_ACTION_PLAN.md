# Next Action Plan

Date: 2026-05-21

## Immediate Rule

Do not start new feature work until the current worktree hygiene questions are resolved or explicitly accepted.

## Day 2 Recommended Order

1. Resolve or intentionally preserve current worktree noise.
   - Decide the fate of `next-env.d.ts`.
   - Decide the fate of `EduOS_Codex_Overnight_Run_Pack_v2/`.
   - Commit the Day 2 handoff documents if accepted.

2. Re-run baseline checks after any worktree hygiene decision.
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - Run `pnpm test:e2e` before claiming user-flow stability or after any UI/auth/navigation changes.

3. Continue with low-risk MVP hardening before new major modules.
   - Verify role-specific navigation entries for admin, teacher, student, and parent.
   - Re-check schedule, resource, homework, attendance, and learning-task flows with seeded demo accounts.
   - Fix only concrete bugs found during those checks.

4. Keep productization high-risk items in RFC or local mock mode until approved.
   - Cloud storage provider credentials and buckets.
   - MFA encrypted secret persistence and backup code hashing.
   - Activity Engine database migration and reporting aggregation.
   - Windows installer, code signing, auto-update, and store publishing.
   - Production deployment, production migration, release tag, CDN invalidation, forced update, and rollback execution.

5. For each Day 2 development slice, keep the existing quality loop.
   - Implement only the selected slice.
   - Run lint, typecheck, and tests.
   - Add e2e when the slice changes a user flow.
   - Update relevant docs.
   - Commit and push only after the quality gate passes.

## Current Non-Code Blockers

- `next-env.d.ts` has a generated path change and needs a decision.
- `EduOS_Codex_Overnight_Run_Pack_v2/` is untracked and needs a decision.

## Product/Operations Blockers

These do not block local safe development, but they block production readiness:

- Cloud resource vendor, bucket/container, credentials, signed URL TTL, and migration approval.
- MFA encryption/KMS, backup-code pepper, recovery policy, rate limits, lockout behavior, and migration approval.
- Activity Engine persistence schema, tenant indexes, audit event names, reporting jobs, and migration approval.
- Windows installer strategy approval, code signing, update channel, and native wrapper security review.
- Production hosting, migration plan, release channel, update manifest publication, forced update policy, rollback target, and operational smoke test approval.

## Minimal Fix Suggestions If Checks Fail Later

The current handoff checks passed. If they fail in a later Day 2 run, use the smallest safe response:

- For lint or typecheck failures: fix only the reported files and rerun the same command.
- For unit-test failures: identify whether the failure is from current changes or pre-existing state before editing.
- For e2e failures: capture the failed route, role, and seed account first; avoid broad UI rewrites until the failing selector or server error is understood.

