# EduOS Permission Matrix

This matrix documents the productization permissions added around resources,
activities, MFA/security policy, and version/update visibility. The source of
truth remains `lib/rbac/permissions.ts`.

## Boundary Rules

- Students never receive admin, teacher portal, finance, scheduling mutation, or security policy permissions.
- Parents only receive own-child viewing permissions and cannot perform student check-ins.
- Teachers can work with their own teaching resources, classes, students, homework, and activity progress, but cannot manage tenant-wide activities or finance data.
- Finance can use finance workflows and manage MFA for its own high-risk account, but cannot schedule, manage teaching resources, manage homework, manage activities, or change security policy.
- Campus admins and academic affairs can manage academic operations and activity delivery, but cannot enforce tenant security policy.
- Super admins and organization admins can manage tenant policy, MFA enforcement, update administration, and all productization operations within the tenant boundary.
- Every protected operation must perform server-side authorization. Frontend button hiding is only a convenience layer.
- Every business query must include `tenantId`; role ownership checks must run after tenant checks.

## Productization Permissions

| Permission | Purpose | Granted to |
| --- | --- | --- |
| `resources:download` | Request server-authorized download URLs for allowed resource files. | Super admin, organization admin, campus admin, academic affairs, teacher, student, parent |
| `activities:manage` | Create, publish, pause, end, and review institution activity definitions. | Super admin, organization admin, campus admin, academic affairs |
| `activities:viewOwn` | View activities assigned to the user's class, student account, or guardian-bound student. | Super admin, organization admin, teacher, student, parent |
| `activities:checkIn` | Submit an assigned student activity check-in. | Super admin, organization admin, student |
| `activities:progress:view` | View activity progress for authorized classes or institution scope. | Super admin, organization admin, campus admin, academic affairs, teacher |
| `security:mfa:manage` | Manage MFA setup for the signed-in high-risk account. | Super admin, organization admin, finance |
| `security:mfa:enforce` | Enforce MFA requirements for high-privilege roles in the tenant. | Super admin, organization admin |
| `security:policy:manage` | Manage tenant security policy such as MFA requirements and recovery rules. | Super admin, organization admin |
| `version:view` | View application version and update status. | Super admin, organization admin, campus admin, academic affairs, finance |
| `updates:manage` | Manage safe update metadata after release process approval. | Super admin, organization admin |

## Role Notes

`SUPER_ADMIN` and `ORG_ADMIN` inherit the tenant-admin permission set except for
role-specific portal routes (`route:teacher`, `route:student`, `route:parent`).
All role-specific data access still requires tenant-scoped server queries and
ownership checks in the feature modules.

`CAMPUS_ADMIN` and `ACADEMIC` receive activity management because activity
delivery is an academic operation. They do not receive `security:policy:manage`,
`security:mfa:enforce`, finance mutation, or update administration.

`TEACHER` receives `activities:viewOwn` and `activities:progress:view` for
assigned classes, plus `resources:manage` and `resources:download` only for
resources tied to the teacher's own classes or explicit authorization. Teachers
must not see another teacher's class resources unless a future delegation model
records that authorization server-side.

`STUDENT` receives `activities:viewOwn`, `activities:checkIn`, and
`resources:download`. This must remain paired with assigned-activity checks and
resource access checks in server code.

`PARENT` receives `activities:viewOwn` and `resources:download` only for
guardian-bound students. Parents cannot submit check-ins for the student unless a
future product decision explicitly adds delegated submissions with audit logs.

`FINANCE` receives `security:mfa:manage` for account hardening and `version:view`
for support diagnostics, but no activity or scheduling mutation permissions.

## Cloud Resource Authorization

Private resource files live in OSS, while resource metadata lives in PostgreSQL.
The browser must never construct private OSS URLs directly. The allowed flow is:

1. The client requests a resource download from the EduOS backend/API.
2. The backend checks `tenantId`, role permission, and ownership or assignment.
3. Only after authorization passes, the backend asks `StorageProvider` for a short-lived signed URL or streams the file through a safe download endpoint.
4. Unauthorized requests return a forbidden result and never call the storage provider to sign the object.

Students can download only assigned resources, homework attachments, mistake
assets, activity word books, and class materials tied to their own student
record. Parents can download only resources for guardian-bound students.
Teachers can download or manage only resources for their own classes or lessons.
Admins and principals can manage resources within the current tenant only.

## Regression Coverage

- `tests/unit/rbac.test.ts` covers student, parent, teacher, finance, admin,
  cross-tenant, and signed URL denial boundaries.
- `tests/rbac-permissions.test.ts` covers the core role matrix and
  `requirePermission` behavior.
- `tests/e2e/permissions.spec.ts` verifies seeded browser flows for common
  cross-role access attempts when a demo database is available.
