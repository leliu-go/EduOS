# EduOS Rollback Plan

## Rollback Principles

Rollback is a human-operated production action. Local scripts in this repository
perform **No deploy**, **No code signing**, and **No production database
migration**.

## Safe Rollback Targets

- Previous Git commit or release tag.
- Previous container/image artifact, if production deployment later uses one.
- Previous static frontend artifact, if production deployment later uses one.
- Previous update manifest metadata.

## Rollback Steps

1. Identify the failing release version and commit.
2. Identify the last known-good version and commit.
3. Freeze non-critical release changes.
4. Confirm whether the release included database migrations.
5. If a migration was involved, stop and use the human-approved database rollback
   procedure for that specific migration.
6. Republish the last known-good application artifact through the approved
   production deployment channel.
7. Update `/api/update-manifest` metadata to point clients to the last known-good
   version.
8. Verify login, role routing, dashboard, mobile teacher/student/parent routes,
   resources, schedules, and homework flows.
9. Record the incident, root cause, and follow-up tasks.

## Update Manifest Rollback

When rolling back metadata, review:

- `latestVersion`
- `minimumSupportedVersion`
- `currentVersion`
- `forceUpdate`
- `changelogUrl`
- `updateUrl`

## Data Safety

- Never delete production data as part of a generic rollback.
- Never run an irreversible migration rollback without an approved migration
  plan.
- Never restore a database snapshot across tenants without tenant-data impact
  review.
- Course resources remain external/cloud-managed and must not be packaged into a
  rollback artifact.

## Verification

After rollback, run smoke checks for:

- Authentication and RBAC.
- Tenant-scoped admin pages.
- Teacher schedule/resources/homework.
- Student schedule/resources/homework.
- Parent schedule/consumption/profile.
- `/api/version`.
- `/api/update-manifest`.
