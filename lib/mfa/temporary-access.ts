import { z } from "zod";

import { defaultTenantMfaPolicy, type MfaEnrollmentStatus } from "./mfa-policy";
import type { RoleKey } from "../rbac/permissions";

export const adminRecoveryAction = "accounts.admin.recover";
export const maximumMfaGraceMs = 24 * 60 * 60 * 1000;

const grantSchema = z.object({
  mfaGraceExpiresAt: z.iso.datetime(),
});

export function isTemporaryMfaAccessActive(input: {
  roleKey: RoleKey;
  enrollmentStatus: MfaEnrollmentStatus;
  grant: { createdAt: Date; afterJson: unknown } | null;
  now?: Date;
}) {
  if (
    !["SUPER_ADMIN", "ORG_ADMIN"].includes(input.roleKey) ||
    input.enrollmentStatus !== "not_enrolled" ||
    !input.grant
  ) {
    return false;
  }

  const parsed = grantSchema.safeParse(input.grant.afterJson);
  if (!parsed.success) return false;

  const now = (input.now ?? new Date()).getTime();
  const createdAt = input.grant.createdAt.getTime();
  const expiresAt = Date.parse(parsed.data.mfaGraceExpiresAt);
  return (
    createdAt <= now &&
    expiresAt > now &&
    expiresAt > createdAt &&
    expiresAt - createdAt <= maximumMfaGraceMs
  );
}

// An operator-issued, audited recovery grant is account/tenant scoped and expires.
// It never sets mfaVerifiedAt, so backup/export operations still require real MFA.
export async function getTemporaryMfaPolicy(input: {
  tenantId: string;
  userId: string;
  roleKey: RoleKey;
  enrollmentStatus: MfaEnrollmentStatus;
}) {
  if (
    !["SUPER_ADMIN", "ORG_ADMIN"].includes(input.roleKey) ||
    input.enrollmentStatus !== "not_enrolled"
  ) {
    return undefined;
  }

  const { prisma } = await import("../prisma");
  const grant = await prisma.auditLog.findFirst({
    where: {
      tenantId: input.tenantId,
      entityId: input.userId,
      OR: [
        { entityType: "user", action: adminRecoveryAction },
        {
          entityType: "UserMfaCredential",
          action: { in: ["mfa.enrollment.started", "mfa.enrollment.verified"] },
        },
      ],
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { createdAt: true, afterJson: true },
  });

  return isTemporaryMfaAccessActive({ ...input, grant })
    ? { ...defaultTenantMfaPolicy, enabled: false }
    : undefined;
}
