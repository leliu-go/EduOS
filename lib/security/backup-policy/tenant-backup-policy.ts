export type TenantBackupPolicy = {
  tenantId: string;
  enabled: boolean;
  maxActiveBackupDevices: number;
  allowStandbyBackupDevice: boolean;
  primaryBackupDeviceId: string | null;
  requireMfaForBackupSync: boolean;
  requireMfaStepUpForExport: boolean;
  requireMfaStepUpForRestore: boolean;
  autoSyncOnAdminLogin: boolean;
  minSyncIntervalMinutes: number;
};

export type PersistedTenantBackupPolicy = {
  tenantId: string;
  enabled?: boolean | null;
  maxActiveBackupDevices?: number | null;
  allowStandbyBackupDevice?: boolean | null;
  primaryBackupDeviceId?: string | null;
  requireMfaForBackupSync?: boolean | null;
  requireMfaStepUpForExport?: boolean | null;
  requireMfaStepUpForRestore?: boolean | null;
  autoSyncOnAdminLogin?: boolean | null;
  minSyncIntervalMinutes?: number | null;
};

export const defaultTenantBackupPolicy = {
  enabled: true,
  maxActiveBackupDevices: 1,
  allowStandbyBackupDevice: false,
  primaryBackupDeviceId: null,
  requireMfaForBackupSync: true,
  requireMfaStepUpForExport: true,
  requireMfaStepUpForRestore: true,
  autoSyncOnAdminLogin: true,
  minSyncIntervalMinutes: 10,
} as const;

export function normalizeTenantBackupPolicy(
  policy: PersistedTenantBackupPolicy,
): TenantBackupPolicy {
  return {
    tenantId: policy.tenantId,
    enabled: policy.enabled ?? defaultTenantBackupPolicy.enabled,
    maxActiveBackupDevices:
      policy.maxActiveBackupDevices ?? defaultTenantBackupPolicy.maxActiveBackupDevices,
    allowStandbyBackupDevice:
      policy.allowStandbyBackupDevice ?? defaultTenantBackupPolicy.allowStandbyBackupDevice,
    primaryBackupDeviceId:
      policy.primaryBackupDeviceId ?? defaultTenantBackupPolicy.primaryBackupDeviceId,
    requireMfaForBackupSync:
      policy.requireMfaForBackupSync ?? defaultTenantBackupPolicy.requireMfaForBackupSync,
    requireMfaStepUpForExport:
      policy.requireMfaStepUpForExport ?? defaultTenantBackupPolicy.requireMfaStepUpForExport,
    requireMfaStepUpForRestore:
      policy.requireMfaStepUpForRestore ?? defaultTenantBackupPolicy.requireMfaStepUpForRestore,
    autoSyncOnAdminLogin:
      policy.autoSyncOnAdminLogin ?? defaultTenantBackupPolicy.autoSyncOnAdminLogin,
    minSyncIntervalMinutes:
      policy.minSyncIntervalMinutes ?? defaultTenantBackupPolicy.minSyncIntervalMinutes,
  };
}

export type PrimaryBackupPromotionDecision =
  | { allowed: true; reason: "allowed" }
  | {
      allowed: false;
      reason:
        | "policy_disabled"
        | "mfa_step_up_required"
        | "primary_device_already_exists"
        | "active_device_limit_reached";
    };

export function canPromotePrimaryBackupDevice(input: {
  policy: TenantBackupPolicy;
  candidateDeviceId: string;
  activePrimaryDeviceCount: number;
  mfaStepUpCompleted: boolean;
}): PrimaryBackupPromotionDecision {
  if (!input.policy.enabled) {
    return { allowed: false, reason: "policy_disabled" };
  }

  if (!input.mfaStepUpCompleted) {
    return { allowed: false, reason: "mfa_step_up_required" };
  }

  const existingPrimaryIsDifferent =
    input.policy.primaryBackupDeviceId &&
    input.policy.primaryBackupDeviceId !== input.candidateDeviceId;

  if (existingPrimaryIsDifferent || input.activePrimaryDeviceCount >= 1) {
    return { allowed: false, reason: "primary_device_already_exists" };
  }

  if (input.activePrimaryDeviceCount >= input.policy.maxActiveBackupDevices) {
    return { allowed: false, reason: "active_device_limit_reached" };
  }

  return { allowed: true, reason: "allowed" };
}
