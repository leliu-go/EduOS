# REVIEW_CHECKLIST.md

Use this checklist after every task.

## 1. Scope Review

- [ ] The task ID is clear.
- [ ] Only the current task was implemented.
- [ ] No future module was built early.
- [ ] No unrelated refactor was introduced.
- [ ] No unnecessary dependency was added.

## 2. Security Review

- [ ] Protected pages require authentication.
- [ ] Server-side authorization exists.
- [ ] Client-side hiding is not the only permission control.
- [ ] Tenant data is scoped by tenantId.
- [ ] Student cannot access teacher/admin/finance data.
- [ ] Parent can only access bound students.
- [ ] Teacher can only access own classes/students/lessons unless explicitly authorized.
- [ ] Finance routes are protected.
- [ ] Passwords are never stored in plain text.
- [ ] No secrets are exposed to client components.

## 3. Data Review

- [ ] New models include id, createdAt, updatedAt.
- [ ] Business models include tenantId.
- [ ] Critical models include status where needed.
- [ ] Relations are named clearly.
- [ ] Unique constraints prevent duplicate business records where needed.
- [ ] Transactions are used for critical mutations.
- [ ] Audit log is written for critical changes.

## 4. Validation Review

- [ ] All forms have validation schemas.
- [ ] All server actions/API routes validate input.
- [ ] Error messages are clear.
- [ ] Destructive actions require confirmation.

## 5. UI Review

- [ ] Page is modern and clean.
- [ ] Layout works on desktop.
- [ ] Layout works on mobile where relevant.
- [ ] Loading state exists.
- [ ] Empty state exists.
- [ ] Error state exists.
- [ ] Tables have search/filter/pagination where relevant.
- [ ] Actions are visible and not visually noisy.
- [ ] Chinese copy is concise and professional.

## 6. Test Review

- [ ] `pnpm lint` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] E2E tests added for user flows where appropriate.
- [ ] New business logic has unit tests where appropriate.

## 7. Performance Review

- [ ] Large lists use pagination.
- [ ] Queries do not obviously cause N+1 issues.
- [ ] Database indexes are added where needed.
- [ ] Heavy client components are avoided unless necessary.

## 8. Completion Summary Required

Every completed task must output:

```txt
Task completed: Txx <name>
Changed files:
- ...

Key decisions:
- ...

Commands run:
- pnpm lint: pass/fail
- pnpm typecheck: pass/fail
- pnpm test: pass/fail

Tests added:
- ...

Risks / unfinished items:
- ...

Review result:
- allow merge / needs fixes
```

## 9. P0 Issues: Must Fix Before Continuing

- Permission bypass.
- Tenant data leak.
- Student can see internal admin/teacher/finance data.
- Parent can see unrelated student data.
- Teacher can see unrelated classes/students.
- Password stored insecurely.
- Critical mutation without server validation.
- Critical finance/course consumption mutation not transactional.
- Test commands fail due to introduced changes.

## 10. P1 Issues: Should Fix Before Continuing

- Missing loading/empty/error state.
- Missing audit log for critical operation.
- Confusing UI copy.
- Missing pagination for large table.
- Incomplete validation.
- Unclear model naming.
- Mock data leaking into production path.
