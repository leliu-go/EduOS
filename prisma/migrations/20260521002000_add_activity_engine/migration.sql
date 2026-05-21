-- Additive Activity Engine first-stage persistence for WORD_CHECKIN.
-- This migration creates tenant-scoped activity metadata, assignments, and
-- check-ins. It does not backfill data, delete data, or create external jobs.

CREATE TYPE "ActivityType" AS ENUM ('WORD_CHECKIN');

CREATE TYPE "ActivityStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'ENDED');

CREATE TYPE "ActivityAssignmentTargetType" AS ENUM ('CAMPUS', 'CLASS_GROUP', 'STUDENT');

CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ActivityType" NOT NULL,
    "status" "ActivityStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "wordListResourceId" TEXT,
    "targetWordCount" INTEGER,
    "dailyCheckInLimit" INTEGER NOT NULL DEFAULT 1,
    "instructions" TEXT,
    "createdById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActivityAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "targetType" "ActivityAssignmentTargetType" NOT NULL,
    "campusId" TEXT,
    "classGroupId" TEXT,
    "studentId" TEXT,
    "assignedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActivityCheckIn" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentUserId" TEXT,
    "submittedById" TEXT,
    "checkedWordCount" INTEGER NOT NULL,
    "note" TEXT,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityCheckIn_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Activity_tenantId_idx" ON "Activity"("tenantId");
CREATE INDEX "Activity_tenantId_status_idx" ON "Activity"("tenantId", "status");
CREATE INDEX "Activity_tenantId_type_idx" ON "Activity"("tenantId", "type");
CREATE INDEX "Activity_tenantId_startsAt_endsAt_idx" ON "Activity"("tenantId", "startsAt", "endsAt");
CREATE INDEX "Activity_tenantId_wordListResourceId_idx" ON "Activity"("tenantId", "wordListResourceId");
CREATE INDEX "Activity_tenantId_createdById_idx" ON "Activity"("tenantId", "createdById");

CREATE UNIQUE INDEX "ActivityAssignment_tenantId_activityId_targetType_campusId_classGroupId_studentId_key" ON "ActivityAssignment"("tenantId", "activityId", "targetType", "campusId", "classGroupId", "studentId");
CREATE INDEX "ActivityAssignment_tenantId_idx" ON "ActivityAssignment"("tenantId");
CREATE INDEX "ActivityAssignment_tenantId_activityId_idx" ON "ActivityAssignment"("tenantId", "activityId");
CREATE INDEX "ActivityAssignment_tenantId_targetType_idx" ON "ActivityAssignment"("tenantId", "targetType");
CREATE INDEX "ActivityAssignment_tenantId_campusId_idx" ON "ActivityAssignment"("tenantId", "campusId");
CREATE INDEX "ActivityAssignment_tenantId_classGroupId_idx" ON "ActivityAssignment"("tenantId", "classGroupId");
CREATE INDEX "ActivityAssignment_tenantId_studentId_idx" ON "ActivityAssignment"("tenantId", "studentId");

CREATE INDEX "ActivityCheckIn_tenantId_idx" ON "ActivityCheckIn"("tenantId");
CREATE INDEX "ActivityCheckIn_tenantId_activityId_idx" ON "ActivityCheckIn"("tenantId", "activityId");
CREATE INDEX "ActivityCheckIn_tenantId_studentId_idx" ON "ActivityCheckIn"("tenantId", "studentId");
CREATE INDEX "ActivityCheckIn_tenantId_activityId_studentId_checkInDate_idx" ON "ActivityCheckIn"("tenantId", "activityId", "studentId", "checkInDate");
CREATE INDEX "ActivityCheckIn_tenantId_studentUserId_idx" ON "ActivityCheckIn"("tenantId", "studentUserId");
CREATE INDEX "ActivityCheckIn_tenantId_checkInDate_idx" ON "ActivityCheckIn"("tenantId", "checkInDate");

ALTER TABLE "Activity" ADD CONSTRAINT "Activity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_wordListResourceId_fkey" FOREIGN KEY ("wordListResourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ActivityAssignment" ADD CONSTRAINT "ActivityAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivityAssignment" ADD CONSTRAINT "ActivityAssignment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivityAssignment" ADD CONSTRAINT "ActivityAssignment_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivityAssignment" ADD CONSTRAINT "ActivityAssignment_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivityAssignment" ADD CONSTRAINT "ActivityAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivityAssignment" ADD CONSTRAINT "ActivityAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ActivityCheckIn" ADD CONSTRAINT "ActivityCheckIn_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivityCheckIn" ADD CONSTRAINT "ActivityCheckIn_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivityCheckIn" ADD CONSTRAINT "ActivityCheckIn_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivityCheckIn" ADD CONSTRAINT "ActivityCheckIn_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
