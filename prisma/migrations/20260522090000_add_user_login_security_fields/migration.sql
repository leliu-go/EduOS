-- Additive login security fields for failed-attempt lockouts and password rotation.
-- This migration only adds nullable/defaulted columns and indexes.

ALTER TABLE "User" ADD COLUMN "failedLoginCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "loginLockLevel" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "loginLockedUntil" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "loginPermanentlyLockedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "lastFailedLoginAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "passwordChangedAt" TIMESTAMP(3);

CREATE INDEX "User_loginLockedUntil_idx" ON "User"("loginLockedUntil");
CREATE INDEX "User_loginPermanentlyLockedAt_idx" ON "User"("loginPermanentlyLockedAt");
