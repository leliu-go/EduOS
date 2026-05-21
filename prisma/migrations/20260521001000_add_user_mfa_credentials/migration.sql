-- Additive MFA/TOTP credential storage.
-- This migration creates a tenant-scoped credential table only. It does not
-- generate TOTP secrets, KMS keys, backup codes, or production credentials.

CREATE TYPE "MfaCredentialStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'LOCKED', 'DISABLED');

CREATE TABLE "UserMfaCredential" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'totp',
    "status" "MfaCredentialStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "encryptedTotpSecret" TEXT NOT NULL,
    "totpSecretKeyId" TEXT NOT NULL,
    "backupCodeHash" TEXT,
    "failedAttemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastVerifiedAt" TIMESTAMP(3),
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMfaCredential_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserMfaCredential_tenantId_userId_provider_key" ON "UserMfaCredential"("tenantId", "userId", "provider");
CREATE INDEX "UserMfaCredential_tenantId_idx" ON "UserMfaCredential"("tenantId");
CREATE INDEX "UserMfaCredential_tenantId_userId_idx" ON "UserMfaCredential"("tenantId", "userId");
CREATE INDEX "UserMfaCredential_tenantId_status_idx" ON "UserMfaCredential"("tenantId", "status");
CREATE INDEX "UserMfaCredential_tenantId_provider_idx" ON "UserMfaCredential"("tenantId", "provider");

ALTER TABLE "UserMfaCredential" ADD CONSTRAINT "UserMfaCredential_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserMfaCredential" ADD CONSTRAINT "UserMfaCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
