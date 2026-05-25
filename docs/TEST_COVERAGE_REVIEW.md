# Test Coverage Review

Date: 2026-05-25

## Existing Strengths

- Login form and route source coverage exists in `tests/login-route-handler.test.ts`.
- Login lockout policy is covered in `tests/login-security-policy.test.ts`.
- MFA crypto and TOTP behavior are covered in `tests/unit/mfa.test.ts` and `tests/unit/mfa-totp-real-flow.test.ts`.
- RBAC role expectations are covered in `tests/core-business-logic.test.ts`.
- Resource authorization and storage provider behavior are covered in `tests/cloud-resource-provider.test.ts` and `tests/storage-provider.test.ts`.
- Finance reports and course-consumption reversal are covered by focused tests.
- E2E specs exist for permissions, mobile schedule/resources, golden path, and responsive UI, but some require a seeded database.

## Tests Added Or Updated In This Review

- `tests/login-route-handler.test.ts`: asserts login route no longer trusts forwarded host/proto headers.
- `tests/login-route-handler.test.ts`: asserts duplicate login server action is not reintroduced.
- `tests/course-consumption-reversal.test.ts`: asserts tenant-scoped course-account restore with count check.
- `tests/finance-reports.test.ts`: asserts finance CSV export uses `Cache-Control: no-store`.
- `tests/e2e/auth.spec.ts`: aligns unauthenticated student resource detail redirect expectations with the student portal layout guard.
- `tests/csv-response.test.ts`: verifies shared CSV download headers and unsafe filename rejection.
- `tests/resource-download-authorization.test.ts`: verifies parent access requires child/resource student-scope intersection when explicit student scope exists.

## Final Commands Run

- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed, 119 test files and 442 tests.
- `pnpm test:e2e -- tests/e2e/auth.spec.ts --workers=1`: passed, 53 tests.
- `pnpm audit`: passed, no known vulnerabilities found.

## Gaps

- Add browser e2e for MFA setup/challenge/rebind with a seeded MFA fixture.
- Add finance reconciliation fixture covering payments, refunds, course consumption, and report totals together.
- Add parent exact-child resource download tests before adding parent download routes.
- Add CI secret scan and dependency audit.
- Add route matrix e2e for every protected portal and settings page.
