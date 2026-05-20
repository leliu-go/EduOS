import { hasPermission, type RoleKey } from "../rbac/permissions";

export type MfaEnforcementMode = "off" | "high_privilege" | "all_staff";

export type MfaEnrollmentStatus =
  | "not_enrolled"
  | "pending_verification"
  | "verified"
  | "locked";

export type MfaRequirementReason =
  | "policy_disabled"
  | "role_not_required"
  | "enrollment_required"
  | "verification_pending"
  | "verification_required"
  | "verified"
  | "locked";

export interface TenantMfaPolicy {
  enabled: boolean;
  enforcement: MfaEnforcementMode;
  gracePeriodHours: number;
  recoveryRequiresAdminApproval: boolean;
  totpIssuer: string;
  maxVerificationAttempts: number;
}

export interface MfaRequirementInput {
  roleKey: RoleKey;
  policy?: TenantMfaPolicy;
  enrollmentStatus: MfaEnrollmentStatus;
  sessionMfaVerified?: boolean;
}

export interface MfaRequirement {
  required: boolean;
  canProceed: boolean;
  reason: MfaRequirementReason;
}

export const defaultTenantMfaPolicy: TenantMfaPolicy = {
  enabled: true,
  enforcement: "high_privilege",
  gracePeriodHours: 24,
  recoveryRequiresAdminApproval: true,
  totpIssuer: "EduOS",
  maxVerificationAttempts: 5,
};

export const highPrivilegeMfaRoles: readonly RoleKey[] = [
  "SUPER_ADMIN",
  "ORG_ADMIN",
  "CAMPUS_ADMIN",
  "ACADEMIC",
  "FINANCE",
] as const;

export const staffMfaRoles: readonly RoleKey[] = [
  "SUPER_ADMIN",
  "ORG_ADMIN",
  "CAMPUS_ADMIN",
  "ACADEMIC",
  "FINANCE",
  "TEACHER",
] as const;

export function roleRequiresMfa(
  roleKey: RoleKey,
  policy: TenantMfaPolicy = defaultTenantMfaPolicy,
) {
  if (!policy.enabled || policy.enforcement === "off") {
    return false;
  }

  if (policy.enforcement === "all_staff") {
    return staffMfaRoles.includes(roleKey);
  }

  return highPrivilegeMfaRoles.includes(roleKey);
}

export function canManageTenantMfaPolicy(roleKey: RoleKey) {
  return (
    hasPermission(roleKey, "security:policy:manage") &&
    hasPermission(roleKey, "security:mfa:enforce")
  );
}

export function canManageOwnMfa(roleKey: RoleKey) {
  return hasPermission(roleKey, "security:mfa:manage");
}

export function evaluateMfaRequirement(input: MfaRequirementInput): MfaRequirement {
  const policy = input.policy ?? defaultTenantMfaPolicy;

  if (!policy.enabled || policy.enforcement === "off") {
    return {
      required: false,
      canProceed: true,
      reason: "policy_disabled",
    };
  }

  if (!roleRequiresMfa(input.roleKey, policy)) {
    return {
      required: false,
      canProceed: true,
      reason: "role_not_required",
    };
  }

  if (input.enrollmentStatus === "locked") {
    return {
      required: true,
      canProceed: false,
      reason: "locked",
    };
  }

  if (input.enrollmentStatus === "not_enrolled") {
    return {
      required: true,
      canProceed: false,
      reason: "enrollment_required",
    };
  }

  if (input.enrollmentStatus === "pending_verification") {
    return {
      required: true,
      canProceed: false,
      reason: "verification_pending",
    };
  }

  if (!input.sessionMfaVerified) {
    return {
      required: true,
      canProceed: false,
      reason: "verification_required",
    };
  }

  return {
    required: true,
    canProceed: true,
    reason: "verified",
  };
}
