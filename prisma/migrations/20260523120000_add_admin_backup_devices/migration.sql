-- Additive Admin backup policy and device binding storage.
-- Safe migration constraints:
-- - creates new enums and tables only
-- - leaves every existing table, field, and row unchanged
-- - does not create or store device private keys, TOTP secrets, recovery keys, or real credentials

CREATE TYPE "AdminBackupDeviceRole" AS ENUM (
    'LOGIN_ONLY',
    'BACKUP_AUTHORIZED',
    'PRIMARY_BACKUP',
    'STANDBY_BACKUP'
);

CREATE TYPE "AdminBackupDeviceStatus" AS ENUM (
    'ACTIVE',
    'REVOKED',
    'LOST',
    'REPLACED'
);

CREATE TABLE "TenantBackupPolicy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "maxActiveBackupDevices" INTEGER NOT NULL DEFAULT 1,
    "allowStandbyBackupDevice" BOOLEAN NOT NULL DEFAULT false,
    "primaryBackupDeviceId" TEXT,
    "requireMfaForBackupSync" BOOLEAN NOT NULL DEFAULT true,
    "requireMfaStepUpForExport" BOOLEAN NOT NULL DEFAULT true,
    "requireMfaStepUpForRestore" BOOLEAN NOT NULL DEFAULT true,
    "autoSyncOnAdminLogin" BOOLEAN NOT NULL DEFAULT true,
    "minSyncIntervalMinutes" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantBackupPolicy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminBackupDevice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "publicKeyFingerprint" TEXT NOT NULL,
    "deviceRole" "AdminBackupDeviceRole" NOT NULL DEFAULT 'LOGIN_ONLY',
    "status" "AdminBackupDeviceStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastSeenAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,
    "replacedByDeviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminBackupDevice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminBackupDeviceChallenge" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "adminUserId" TEXT,
    "nonceHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'core_backup_sync',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminBackupDeviceChallenge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TenantBackupPolicy_tenantId_key" ON "TenantBackupPolicy"("tenantId");
CREATE INDEX "TenantBackupPolicy_tenantId_idx" ON "TenantBackupPolicy"("tenantId");
CREATE INDEX "TenantBackupPolicy_tenantId_enabled_idx" ON "TenantBackupPolicy"("tenantId", "enabled");
CREATE INDEX "TenantBackupPolicy_tenantId_primaryBackupDeviceId_idx" ON "TenantBackupPolicy"("tenantId", "primaryBackupDeviceId");

CREATE UNIQUE INDEX "AdminBackupDevice_tenantId_deviceId_key" ON "AdminBackupDevice"("tenantId", "deviceId");
CREATE INDEX "AdminBackupDevice_tenantId_idx" ON "AdminBackupDevice"("tenantId");
CREATE INDEX "AdminBackupDevice_tenantId_adminUserId_idx" ON "AdminBackupDevice"("tenantId", "adminUserId");
CREATE INDEX "AdminBackupDevice_tenantId_deviceRole_status_idx" ON "AdminBackupDevice"("tenantId", "deviceRole", "status");
CREATE INDEX "AdminBackupDevice_tenantId_publicKeyFingerprint_idx" ON "AdminBackupDevice"("tenantId", "publicKeyFingerprint");
CREATE INDEX "AdminBackupDevice_tenantId_lastSyncAt_idx" ON "AdminBackupDevice"("tenantId", "lastSyncAt");

CREATE UNIQUE INDEX "AdminBackupDeviceChallenge_tenantId_nonceHash_key" ON "AdminBackupDeviceChallenge"("tenantId", "nonceHash");
CREATE INDEX "AdminBackupDeviceChallenge_tenantId_deviceId_expiresAt_idx" ON "AdminBackupDeviceChallenge"("tenantId", "deviceId", "expiresAt");
CREATE INDEX "AdminBackupDeviceChallenge_tenantId_adminUserId_idx" ON "AdminBackupDeviceChallenge"("tenantId", "adminUserId");
CREATE INDEX "AdminBackupDeviceChallenge_tenantId_purpose_idx" ON "AdminBackupDeviceChallenge"("tenantId", "purpose");
CREATE INDEX "AdminBackupDeviceChallenge_tenantId_usedAt_idx" ON "AdminBackupDeviceChallenge"("tenantId", "usedAt");

ALTER TABLE "TenantBackupPolicy" ADD CONSTRAINT "TenantBackupPolicy_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AdminBackupDevice" ADD CONSTRAINT "AdminBackupDevice_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AdminBackupDevice" ADD CONSTRAINT "AdminBackupDevice_adminUserId_fkey"
    FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AdminBackupDevice" ADD CONSTRAINT "AdminBackupDevice_revokedById_fkey"
    FOREIGN KEY ("revokedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AdminBackupDeviceChallenge" ADD CONSTRAINT "AdminBackupDeviceChallenge_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AdminBackupDeviceChallenge" ADD CONSTRAINT "AdminBackupDeviceChallenge_adminUserId_fkey"
    FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
