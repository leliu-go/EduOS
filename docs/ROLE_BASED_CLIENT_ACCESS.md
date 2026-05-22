# Role-Based Client Access

## One Client, Multiple Portals

EduOS uses one installed PWA or future desktop shell. The account role determines the accessible portal:

| Role | Default portal | Forbidden examples |
| --- | --- | --- |
| Admin / principal | `/dashboard` | teacher/student mobile portal as a different role |
| Academic affairs | `/dashboard` | finance mutation unless permission grants it |
| Finance | `/dashboard/payments`, `/dashboard/finance-reports` | teaching resources, homework mutation, scheduling mutation |
| Teacher | `/teacher` | admin dashboard, finance, system settings, other teacher classes |
| Student | `/student` | admin dashboard, teacher portal, finance, other student records |
| Parent | `/parent` | admin dashboard, teacher portal, unrelated student records |

## Enforcement Model

Navigation filtering improves usability, but enforcement happens server-side:

1. Protected layouts and pages call `requirePermission(...)`.
2. Server actions and route handlers validate role permissions.
3. Queries receive `currentUser.tenantId`.
4. Teacher queries additionally check teacher ownership or explicit assignment.
5. Student queries additionally check student ownership.
6. Resource download routes authorize before creating a signed URL.

## Required Denials

- Unauthenticated users go to login.
- Students cannot access Admin, teacher, finance, or other student data.
- Teachers cannot access finance, system settings, other teacher classes, or another tenant.
- Admin users can manage only the current tenant.
- Finance users can access finance modules but cannot mutate teaching resources, homework, or mistakes.

These boundaries are covered by RBAC unit tests and seeded Playwright permission tests when a database is available.
