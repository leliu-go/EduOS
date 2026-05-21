# Staging Deployment Checklist

Date: 2026-05-21

## Preflight

- [ ] ECS Ubuntu 22.04 is reachable.
- [ ] `/opt/eduos/.env.production.local` exists on ECS.
- [ ] Domain `eduos.study-go.top` points to ECS.
- [ ] RDS database `eduos` exists.
- [ ] RDS account `eduos_app` exists.
- [ ] RDS whitelist includes ECS private IP.
- [ ] OSS bucket `eduos-prod-resources-studygo` is private.
- [ ] OSS public access block is enabled.
- [ ] RAM credentials are stored only on ECS or a secret manager.
- [ ] `.env.production.local` is not committed.

## Migration Review

Migration file generated for empty staging database:

```text
prisma/migrations/20260521000000_baseline/migration.sql
```

This is a baseline migration from an empty schema to the current EduOS schema. Run it only after confirming the target staging database has no existing EduOS tables, or after a human approves a baseline strategy for an existing database.

Before running staging migration, inspect SQL for:

- [ ] No `DROP TABLE`.
- [ ] No `DROP COLUMN`.
- [ ] No `TRUNCATE`.
- [ ] No `DELETE FROM`.
- [ ] No `prisma migrate reset`.
- [ ] Only additive `CREATE TABLE`, nullable `ADD COLUMN`, enum creation, and index creation are present.

Stage 4 Resource metadata SQL must be reviewed for:

```sql
ALTER TABLE "Resource" ADD COLUMN "provider" TEXT;
ALTER TABLE "Resource" ADD COLUMN "bucket" TEXT;
ALTER TABLE "Resource" ADD COLUMN "objectKey" TEXT;
ALTER TABLE "Resource" ADD COLUMN "originalName" TEXT;
ALTER TABLE "Resource" ADD COLUMN "size" INTEGER;
ALTER TABLE "Resource" ADD COLUMN "checksum" TEXT;
ALTER TABLE "Resource" ADD COLUMN "createdById" TEXT;
CREATE INDEX "Resource_tenantId_provider_idx" ON "Resource"("tenantId", "provider");
CREATE INDEX "Resource_tenantId_objectKey_idx" ON "Resource"("tenantId", "objectKey");
```

Codex local scan result on 2026-05-21: no `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, `DELETE FROM`, or `migrate reset` pattern was found in the generated baseline SQL.

Stage G MFA credential SQL must be reviewed for:

```sql
CREATE TYPE "MfaCredentialStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'LOCKED', 'DISABLED');
CREATE TABLE "UserMfaCredential" (...);
CREATE UNIQUE INDEX "UserMfaCredential_tenantId_userId_provider_key" ON "UserMfaCredential"("tenantId", "userId", "provider");
ALTER TABLE "UserMfaCredential" ADD CONSTRAINT "UserMfaCredential_tenantId_fkey" ...;
ALTER TABLE "UserMfaCredential" ADD CONSTRAINT "UserMfaCredential_userId_fkey" ...;
```

- [ ] Review `prisma/migrations/20260521001000_add_user_mfa_credentials/migration.sql`.
- [ ] Confirm MFA migration only creates an enum, table, indexes, and foreign keys.
- [ ] Confirm `MFA_ENCRYPTION_KEY_ID`, `MFA_TOTP_SECRET_ENCRYPTION_KEY`, and `MFA_BACKUP_CODE_PEPPER` are set on ECS before enabling real MFA enrollment.

Stage H Activity Engine SQL must be reviewed for:

```sql
CREATE TYPE "ActivityType" AS ENUM ('WORD_CHECKIN');
CREATE TYPE "ActivityStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'ENDED');
CREATE TYPE "ActivityAssignmentTargetType" AS ENUM ('CAMPUS', 'CLASS_GROUP', 'STUDENT');
CREATE TABLE "Activity" (...);
CREATE TABLE "ActivityAssignment" (...);
CREATE TABLE "ActivityCheckIn" (...);
```

- [ ] Review `prisma/migrations/20260521002000_add_activity_engine/migration.sql`.
- [ ] Confirm Activity Engine migration only creates enums, tables, indexes, and foreign keys.
- [ ] Confirm no AI scoring, voice recognition, WeChat/SMS, or external push provider is enabled.

## Staging Smoke

- [ ] `scripts/server/check-rds-connection.sh`
- [ ] `scripts/server/check-oss-provider.sh`
- [ ] `scripts/server/smoke-http.sh`
- [ ] Login as admin/teacher/student/parent.
- [ ] Confirm resource permissions on teacher and student pages.
- [ ] Confirm `/api/version` returns public metadata only.
