# Security And Maintainability Summary

Date: 2026-05-25

## P0

No confirmed P0 issue was found in tracked product code during this review.

## P1 Fixed

- Removed trust in `x-forwarded-host` / `x-forwarded-proto` from login redirects.
- Made course-consumption reversal restore the course account with an explicit tenant predicate and count check.
- Added `Cache-Control: no-store` to finance report CSV export.
- Resolved two moderate transitive dependency advisories with pnpm overrides.
- Updated unauthenticated student resource detail e2e expectation to match the student layout guard.

## P1 Remaining

- Retire or delegate duplicate login server action path after confirming no imports.
- Add preview/confirmation to account import for existing global user matches.
- Add e2e MFA fixture and browser coverage.
- Add exact parent-child-resource policy before exposing parent download endpoints.
- Split large scheduling and account files in future small refactors.

## P2 Remaining

- Wire PWA cache clear into logout/account switch.
- Standardize CSV response helpers.
- Reduce source-string test brittleness over time.
- Check Chinese text encoding consistency in editors and deployment output.

## Production Safety

- No production migration was executed.
- No database drop/reset/truncate was executed.
- `.env.production.local` was not read, printed, modified, or staged.
- No real secret was found in tracked source during this pass.

## Final Verification

- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed, 118 files and 439 tests.
- `pnpm test:e2e -- tests/e2e/auth.spec.ts --workers=1`: passed, 53 tests.
- `pnpm audit`: passed, no known vulnerabilities found.
