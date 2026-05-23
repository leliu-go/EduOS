import { describe, expect, it } from "vitest";

import {
  canPromotePrimaryBackupDevice,
  defaultTenantBackupPolicy,
  normalizeTenantBackupPolicy,
} from "../../lib/security/backup-policy/tenant-backup-policy";

describe("tenant backup policy", () => {
  it("uses a conservative single-primary default policy", () => {
    expect(defaultTenantBackupPolicy).toMatchObject({
      enabled: true,
      maxActiveBackupDevices: 1,
      allowStandbyBackupDevice: false,
      requireMfaForBackupSync: true,
      requireMfaStepUpForExport: true,
      requireMfaStepUpForRestore: true,
      autoSyncOnAdminLogin: true,
      minSyncIntervalMinutes: 10,
    });
  });

  it("fills missing persisted policy fields with safe defaults", () => {
    expect(
      normalizeTenantBackupPolicy({
        tenantId: "tenant-a",
        enabled: null,
        maxActiveBackupDevices: null,
        allowStandbyBackupDevice: null,
        primaryBackupDeviceId: null,
        requireMfaForBackupSync: null,
        requireMfaStepUpForExport: null,
        requireMfaStepUpForRestore: null,
        autoSyncOnAdminLogin: null,
        minSyncIntervalMinutes: null,
      }),
    ).toMatchObject({
      tenantId: "tenant-a",
      enabled: true,
      maxActiveBackupDevices: 1,
      allowStandbyBackupDevice: false,
      primaryBackupDeviceId: null,
      requireMfaForBackupSync: true,
      requireMfaStepUpForExport: true,
      requireMfaStepUpForRestore: true,
      autoSyncOnAdminLogin: true,
      minSyncIntervalMinutes: 10,
    });
  });

  it("prevents a second primary backup device while max active devices is one", () => {
    expect(
      canPromotePrimaryBackupDevice({
        policy: {
          ...defaultTenantBackupPolicy,
          tenantId: "tenant-a",
          primaryBackupDeviceId: "device-primary",
        },
        candidateDeviceId: "device-second",
        activePrimaryDeviceCount: 1,
        mfaStepUpCompleted: true,
      }),
    ).toEqual({
      allowed: false,
      reason: "primary_device_already_exists",
    });
  });

  it("requires MFA step-up before primary promotion", () => {
    expect(
      canPromotePrimaryBackupDevice({
        policy: {
          ...defaultTenantBackupPolicy,
          tenantId: "tenant-a",
          primaryBackupDeviceId: null,
        },
        candidateDeviceId: "device-a",
        activePrimaryDeviceCount: 0,
        mfaStepUpCompleted: false,
      }),
    ).toEqual({
      allowed: false,
      reason: "mfa_step_up_required",
    });
  });
});
