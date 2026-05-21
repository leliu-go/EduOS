import {
  evaluateMfaRequirement,
  type MfaEnrollmentStatus,
  type TenantMfaPolicy,
} from "@/lib/mfa/mfa-policy";
import type { RoleKey } from "@/lib/rbac/permissions";

export type MfaLoginDecision =
  | { action: "allow"; reason: "policy_disabled" | "role_not_required" | "verified" }
  | { action: "enroll"; reason: "enrollment_required" }
  | { action: "challenge"; reason: "verification_required" | "verification_pending" }
  | { action: "deny"; reason: "locked" };

export function getPostPasswordMfaLoginDecision(input: {
  roleKey: RoleKey;
  enrollmentStatus: MfaEnrollmentStatus;
  sessionMfaVerified?: boolean;
  policy?: TenantMfaPolicy;
}): MfaLoginDecision {
  const requirement = evaluateMfaRequirement(input);

  if (requirement.canProceed) {
    return {
      action: "allow",
      reason: requirement.reason as "policy_disabled" | "role_not_required" | "verified",
    };
  }

  if (requirement.reason === "enrollment_required") {
    return {
      action: "enroll",
      reason: requirement.reason,
    };
  }

  if (requirement.reason === "locked") {
    return {
      action: "deny",
      reason: requirement.reason,
    };
  }

  if (
    requirement.reason === "verification_required" ||
    requirement.reason === "verification_pending"
  ) {
    return {
      action: "challenge",
      reason: requirement.reason,
    };
  }

  return {
    action: "deny",
    reason: "locked",
  };
}
