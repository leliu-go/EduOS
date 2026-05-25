# RBAC And tenantId Isolation Review

Date: 2026-05-25

## Reviewed Files

- `lib/rbac/permissions.ts`
- `lib/rbac/require-permission.ts`
- `lib/auth/current-user.ts`
- `app/(dashboard)/layout.tsx`
- `app/(mobile)/student/layout.tsx`
- `app/(mobile)/teacher/layout.tsx`
- `features/resources/queries.ts`
- `features/homework/queries.ts`
- `features/scheduling/actions.ts`
- `features/course-consumptions/actions.ts`
- `features/payments/actions.ts`
- `features/refunds/actions.ts`

## Findings

### P1 - Course-consumption reversal account update needed explicit tenant predicate

`features/course-consumptions/actions.ts` already found the consumption record with `tenantId`, but the `courseAccount` update used a unique id update. This review tightened it to `updateMany` with `tenantId: currentUser.tenantId` and checked the count.

### P1 - Teacher account invitation needs continued test coverage

Teachers can invite student accounts through `accounts:invite`, but `features/accounts/actions.ts` contains extra teacher-scope logic to restrict class ownership. This should stay covered by tests because the permission name alone is broad.

### P2 - Parent resource policy helper is coarse

`lib/resources/resource-access-policy.ts` allows parent access when the parent is in `guardianUserIds` and `guardianStudentUserIds` is non-empty. Current student download routes do not expose parent downloads, but a future parent download route should pass and verify the exact child-to-resource relation, not just a non-empty guardian student list.

## Positive Controls

- `requirePermission()` checks server-side permissions and enforces MFA where required.
- `getCurrentUser()` revalidates tenant, role, status, and lock state from the database for every session.
- Student, teacher, parent, finance, and admin route permissions are separated in `lib/rbac/permissions.ts`.
- Resource, finance, scheduling, homework, and refund queries reviewed use `currentUser.tenantId` or explicit tenant parameters.

## Remaining Risks

- Add source tests that scan high-risk server actions for `requirePermission` plus tenant predicates.
- Add browser e2e for teacher-other-class denial and parent-child-only access once fixtures are stable.

