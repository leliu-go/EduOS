# EduOS Finance Permissions

Date: 2026-05-21

## Permissions

- `finance:reports:view`: view ledgers and finance reports.
- `finance:mutate`: create manual payments, create refund requests, approve refunds, and perform finance adjustments.
- `courseConsumption:view`: view course-consumption ledger.
- `courseConsumption:mutate`: create or reverse course-consumption entries.

## Role Rules

- Organization admins can manage tenant finance data.
- Finance staff can view reports and perform finance mutations.
- Academic staff can manage attendance/course-consumption flows only when granted relevant permissions.
- 学生、家长、老师不能进入财务后台.
- Parents and students may view their own authorized payment summaries only through role-specific portals.
- Teachers cannot access finance backend pages or mutate finance records.

## Server Controls

- Finance mutations must call `requirePermission("finance:mutate")`.
- Ledger/report pages must call `requirePermission("finance:reports:view")` or a stricter permission.
- All finance queries must include `tenantId`.
- Business-critical finance mutations must write audit logs.
