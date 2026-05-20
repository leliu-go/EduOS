# RFC: Activity Engine First Stage

Date: 2026-05-21

## Status

Safe first-stage activity primitives implemented. Persistent database models,
publishing workflows, and production reporting queries are deferred for reviewed
migrations and later product work.

## Goals

- Keep one EduOS app with role-aware activity behavior.
- Introduce a generic Activity Engine that can support multiple future activity
  types.
- Implement the first supported type: `WORD_CHECKIN`.
- Ensure students only see assigned published activities.
- Ensure parents only see activities for guardian-bound students.
- Ensure teachers only see activity data for their own classes.
- Require resource authorization before an activity can attach or use a resource.

## Non-Goals

- No irreversible Prisma migration is applied in this stage.
- No production activity reports or dashboards are built in this stage.
- No paid resource, notification, or analytics service is configured.
- No separate student, teacher, or admin app is created.

## Implemented Modules

- `features/activities/activity-schema.ts`
  - `activityCreateSchema`
  - `activityAssignmentSchema`
  - `wordCheckinActivityConfigSchema`
  - `wordCheckinSubmissionSchema`
- `features/activities/activity-policy.ts`
  - `canManageActivity`
  - `canViewActivity`
  - `canSubmitWordCheckIn`
  - `canAttachResourceToActivity`
  - `canUseActivityResource`
- `features/activities/word-checkin.ts`
  - `parseWordCheckinActivity`
  - `parseWordCheckinSubmission`
  - `calculateWordCheckinProgress`

## First Activity Type

`WORD_CHECKIN` supports:

- Target word count.
- Daily check-in limit.
- Optional word-list resource reference.
- Class-group or individual-student assignment.
- Student check-in submissions with checked word count and optional note.

## Authorization Model

Activity visibility is tenant-scoped first. After tenant scope:

- `SUPER_ADMIN` and `ORG_ADMIN` can manage tenant activities.
- `CAMPUS_ADMIN` and `ACADEMIC` can manage academic activity delivery.
- `TEACHER` can view activity progress only when listed as an activity teacher.
- `STUDENT` can view and check in only when assigned and the activity is
  `PUBLISHED`.
- `PARENT` can view only when the activity is published and assigned to a
  guardian-bound student.
- `FINANCE` has no activity management or visibility permission.

Resource use requires both:

1. Activity visibility for the actor.
2. Resource authorization via `canAccessResourceFile`.

## Proposed Persistence Model

The first reviewed migration should introduce tenant-scoped models similar to:

```prisma
model Activity {
  id          String   @id @default(cuid())
  tenantId    String
  type        String
  status      String
  title       String
  description String?
  configJson  Json
  startsAt    DateTime
  endsAt      DateTime
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ActivityAssignment {
  id           String   @id @default(cuid())
  tenantId     String
  activityId   String
  classGroupId String?
  studentId    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model ActivityCheckIn {
  id              String   @id @default(cuid())
  tenantId        String
  activityId      String
  studentId       String
  checkedWordCount Int
  note            String?
  checkedInAt      DateTime @default(now())
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

Publishing, pausing, ending, and check-in mutation flows must write audit logs.
Indexes should cover `tenantId`, `activityId`, `studentId`, `classGroupId`, and
`status`.

## Deferred Human Approval

- Approve activity persistence models and indexes.
- Approve audit-event names for publish, pause, end, assignment, and check-in.
- Approve reporting aggregation strategy before building dashboards.
- Approve migration rollout in staging before production.
