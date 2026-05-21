# EduOS Activity Engine Plan

The Activity Engine is a shared activity framework inside the single EduOS app.
The first supported activity type is `WORD_CHECKIN`.

## Stage 1 Scope

- Admin/principal/academic/campus users can create and publish activities.
- Activities can target a campus, class group, or individual student.
- Published activities are visible to assigned students, bound parents, assigned
  teachers, and tenant admins.
- Students can submit daily word check-ins.
- Teachers can view progress only for their own classes.
- Admin/principal users can view tenant-level progress.

## Explicitly Out Of Scope

- AI scoring.
- Voice recognition.
- WeChat/SMS push.
- Complex points mall or redemption logic.
- Cross-tenant activity visibility.

## Persistence

Generated additive migration:

- `prisma/migrations/20260521002000_add_activity_engine/migration.sql`

The migration creates `Activity`, `ActivityAssignment`, and `ActivityCheckIn`.
It adds only new tables, enums, indexes, and foreign keys. No production
migration has been executed by Codex.

## Authorization

- Activity creation and publishing require `activities:manage`.
- Word check-in submission requires `activities:checkIn`.
- All queries and mutations must include `tenantId`.
- Resource-backed word books still use the resource signed URL flow; students
  and teachers do not receive direct OSS credentials.

## Test Coverage

- `tests/activity-engine.test.ts` covers schemas, policy, and resource use.
- `tests/unit/activity.test.ts` covers creation, publishing, student check-in,
  teacher progress visibility, server permissions, and audit hooks.
