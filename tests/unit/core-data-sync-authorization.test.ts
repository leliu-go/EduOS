import { describe, expect, it } from "vitest";

import { authorizeCoreDataSync } from "../../lib/backup/core-data-sync-authorization";
import { defaultTenantBackupPolicy } from "../../lib/security/backup-policy/tenant-backup-policy";

const now = new Date("2026-05-23T10:00:00.000Z");

const baseInput = {
  currentUser: {
    id: "admin-a",
    tenantId: "tenant-a",
    roleKey: "ORG_ADMIN",
  },
  session: {
    mfaCompleted: true,
  },
  policy: {
    ...defaultTenantBackupPolicy,
    tenantId: "tenant-a",
    primaryBackupDeviceId: "device-primary",
  },
  device: {
    tenantId: "tenant-a",
    adminUserId: "admin-a",
    deviceId: "device-primary",
    deviceRole: "PRIMARY_BACKUP",
    status: "ACTIVE",
    lastSyncAt: new Date("2026-05-23T09:00:00.000Z"),
  },
  challenge: {
    valid: true,
    deviceId: "device-primary",
    expiresAt: new Date("2026-05-23T10:01:00.000Z"),
  },
  now,
  syncMode: "manual" as const,
};

describe("core data sync authorization", () => {
  it("allows admin MFA sessions from the active primary backup device", () => {
    expect(authorizeCoreDataSync(baseInput)).toEqual({
      allowed: true,
      reason: "authorized",
    });
  });

  it.each([
    ["non_admin_role", { currentUser: { ...baseInput.currentUser, roleKey: "FINANCE" } }],
    ["mfa_required", { session: { mfaCompleted: false } }],
    ["device_not_registered", { device: null }],
    [
      "device_not_primary",
      { device: { ...baseInput.device, deviceRole: "LOGIN_ONLY" } },
    ],
    ["device_revoked", { device: { ...baseInput.device, status: "REVOKED" } }],
    ["signature_invalid", { challenge: { ...baseInput.challenge, valid: false } }],
    ["cross_tenant_denied", { device: { ...baseInput.device, tenantId: "tenant-b" } }],
  ])("rejects %s", (reason, patch) => {
    expect(authorizeCoreDataSync({ ...baseInput, ...patch })).toEqual({
      allowed: false,
      reason,
    });
  });

  it("rate limits automatic sync while allowing manual sync", () => {
    const recentDevice = {
      ...baseInput.device,
      lastSyncAt: new Date("2026-05-23T09:55:00.000Z"),
    };

    expect(
      authorizeCoreDataSync({
        ...baseInput,
        device: recentDevice,
        syncMode: "auto",
      }),
    ).toEqual({
      allowed: false,
      reason: "sync_interval_too_short",
    });

    expect(
      authorizeCoreDataSync({
        ...baseInput,
        device: recentDevice,
        syncMode: "manual",
      }),
    ).toEqual({
      allowed: true,
      reason: "authorized",
    });
  });
});
