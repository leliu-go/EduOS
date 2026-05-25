# Permission Gaps

Date: 2026-05-25

## P0

No confirmed P0 permission gap was found in this review.

## P1

- `features/accounts/actions.ts`: account import/linking is powerful. Add a preview step and admin confirmation for existing global users matched by email or phone.
- `features/course-consumptions/actions.ts`: tenant-scoped account restore was fixed in this pass. Keep regression coverage in `tests/course-consumption-reversal.test.ts`.
- `lib/resources/resource-access-policy.ts`: parent resource access should be made exact before adding parent download endpoints.

## P2

- Add a permission test matrix generated from `lib/rbac/permissions.ts` so new permissions must explicitly declare expected role access.
- Add route health e2e for all protected settings pages.

