import type { RoleKey } from "@/lib/rbac/permissions";
import type { TenantBackupPolicy } from "@/lib/security/backup-policy/tenant-backup-policy";
import type {
  AdminBackupDeviceRole,
  AdminBackupDeviceStatus,
} from "@/lib/security/device-binding/admin-backup-device";

export type CoreDataSyncDecision =
  | { allowed: true; reason: "authorized" }
  | {
      allowed: false;
      reason:
        | "non_admin_role"
        | "mfa_required"
        | "backup_policy_disabled"
        | "device_not_registered"
        | "device_not_active"
        | "device_revoked"
        | "device_not_primary"
        | "signature_invalid"
        | "challenge_expired"
        | "cross_tenant_denied"
        | "sync_interval_too_short";
    };

export type CoreDataSyncAuthorizationInput = {
  currentUser: {
    id: string;
    tenantId: string;
    roleKey: RoleKey | string;
  };
  session: {
    mfaCompleted: boolean;
  };
  policy: TenantBackupPolicy;
  device: {
    tenantId: string;
    adminUserId: string;
    deviceId: string;
    deviceRole: AdminBackupDeviceRole | string;
    status: AdminBackupDeviceStatus | string;
    lastSyncAt?: Date | null;
  } | null;
  challenge: {
    valid: boolean;
    deviceId: string;
    expiresAt: Date;
  };
  now: Date;
  syncMode: "auto" | "manual";
};

const adminRoles = new Set(["SUPER_ADMIN", "ORG_ADMIN"]);

function minutesBetween(later: Date, earlier: Date) {
  return (later.getTime() - earlier.getTime()) / 60_000;
}

export function authorizeCoreDataSync(input: CoreDataSyncAuthorizationInput): CoreDataSyncDecision {
  if (!adminRoles.has(input.currentUser.roleKey)) {
    return { allowed: false, reason: "non_admin_role" };
  }

  if (input.policy.requireMfaForBackupSync && !input.session.mfaCompleted) {
    return { allowed: false, reason: "mfa_required" };
  }

  if (!input.policy.enabled) {
    return { allowed: false, reason: "backup_policy_disabled" };
  }

  if (!input.device) {
    return { allowed: false, reason: "device_not_registered" };
  }

  if (
    input.device.tenantId !== input.currentUser.tenantId ||
    input.policy.tenantId !== input.currentUser.tenantId
  ) {
    return { allowed: false, reason: "cross_tenant_denied" };
  }

  if (input.device.status === "REVOKED") {
    return { allowed: false, reason: "device_revoked" };
  }

  if (input.device.status !== "ACTIVE") {
    return { allowed: false, reason: "device_not_active" };
  }

  if (
    input.device.deviceRole !== "PRIMARY_BACKUP" &&
    !(input.policy.allowStandbyBackupDevice && input.device.deviceRole === "STANDBY_BACKUP")
  ) {
    return { allowed: false, reason: "device_not_primary" };
  }

  if (
    !input.challenge.valid ||
    input.challenge.deviceId !== input.device.deviceId
  ) {
    return { allowed: false, reason: "signature_invalid" };
  }

  if (input.challenge.expiresAt.getTime() <= input.now.getTime()) {
    return { allowed: false, reason: "challenge_expired" };
  }

  if (
    input.syncMode === "auto" &&
    input.device.lastSyncAt &&
    minutesBetween(input.now, input.device.lastSyncAt) < input.policy.minSyncIntervalMinutes
  ) {
    return { allowed: false, reason: "sync_interval_too_short" };
  }

  return { allowed: true, reason: "authorized" };
}
