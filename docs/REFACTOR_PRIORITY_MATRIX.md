# Refactor Priority Matrix

Date: 2026-05-25

## P1 - Next Small Refactors

| Area | Files | Reason | Suggested Small Step |
| --- | --- | --- | --- |
| Scheduling page | `app/(dashboard)/dashboard/scheduling/page.tsx` | 719-line UI file with multiple responsibilities | Extract month grid and date picker controls into pure components |
| Account actions | `features/accounts/actions.ts` | 634-line high-risk account lifecycle service | Split import/export helpers from lifecycle mutations |
| Homework scope | `features/homework/actions.ts`, `features/homework/queries.ts` | Role-specific logic is dense | Extract student/teacher/admin scope builders |
| Finance exports | finance export routes | Cache/header rules should be uniform | Add small CSV response helper with no-store defaults |
| Login duplication | `app/api/auth/login/route.ts`, `lib/auth/actions.ts` | Two auth paths can drift | Fixed 2026-05-26: removed unused `loginAction`; keep active login in route handler |

## P2 - Later Cleanup

| Area | Files | Reason |
| --- | --- | --- |
| Mobile portals | `app/(mobile)/student/page.tsx`, `app/(mobile)/parent/page.tsx` | Page-level duplicated card/data shaping |
| Source assertion tests | many `tests/*.test.ts` | Useful but brittle for refactors |
| Prisma schema organization | `prisma/schema.prisma` | Large schema needs continued section discipline |

## Not Recommended Now

- Rewriting RBAC.
- Replacing Prisma.
- Replacing Tailwind/shadcn.
- Moving to monorepo.
- Large page redesign in a security-hardening sprint.
