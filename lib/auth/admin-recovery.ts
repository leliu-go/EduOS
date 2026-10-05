import { z } from "zod";

import { hashPassword } from "./password";
import { getAdminLoginUnlockReset } from "./login-security";
import { adminRecoveryAction, maximumMfaGraceMs } from "../mfa/temporary-access";

export const adminRecoverySchema = z
  .object({
    username: z.string().trim().min(1).max(100),
    tenantSlug: z.string().trim().min(1).max(100),
    password: z.string().min(8).max(100),
    temporaryMfaHours: z.number().int().min(0).max(24).default(0),
    confirmation: z.literal("RESET_ADMIN_ACCESS"),
  })
  .strict();

export async function recoverAdminAccount(raw: unknown) {
  const input = adminRecoverySchema.parse(raw);
  const { prisma } = await import("../prisma");
  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { username: input.username },
      select: {
        id: true,
        memberships: {
          select: {
            id: true,
            tenantId: true,
            tenant: { select: { slug: true, status: true } },
            role: { select: { key: true, status: true } },
          },
        },
      },
    });
    const membership = user?.memberships.find(
      (entry) =>
        entry.tenant.slug === input.tenantSlug &&
        entry.tenant.status === "ACTIVE" &&
        entry.role.status === "ACTIVE" &&
        ["SUPER_ADMIN", "ORG_ADMIN"].includes(entry.role.key),
    );

    if (!user || !membership) throw new Error("Target admin membership not found.");
    if (user.memberships.some((entry) => entry.tenantId !== membership.tenantId)) {
      throw new Error("Multi-tenant account requires a separate recovery review.");
    }

    const now = new Date();
    const mfaGraceExpiresAt = new Date(
      now.getTime() + Math.min(input.temporaryMfaHours * 60 * 60 * 1000, maximumMfaGraceMs),
    ).toISOString();
    await tx.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        status: "ACTIVE",
        passwordChangedAt: now,
        ...getAdminLoginUnlockReset(),
      },
    });
    await tx.membership.update({
      where: { id: membership.id },
      data: { status: "ACTIVE" },
    });
    const mfa = await tx.userMfaCredential.updateMany({
      where: { tenantId: membership.tenantId, userId: user.id },
      data: {
        status: "DISABLED",
        encryptedTotpSecret: "",
        totpSecretKeyId: "",
        backupCodeHash: null,
        failedAttemptCount: 0,
        lastVerifiedAt: null,
        lockedUntil: null,
      },
    });
    const devices = await tx.adminBackupDevice.updateMany({
      where: { tenantId: membership.tenantId, adminUserId: user.id, status: "ACTIVE" },
      data: { status: "REVOKED", revokedAt: now },
    });
    await tx.auditLog.create({
      data: {
        tenantId: membership.tenantId,
        actorUserId: null,
        action: adminRecoveryAction,
        entityType: "user",
        entityId: user.id,
        reason: "Owner-authorized server-side administrator recovery",
        afterJson: {
          mfaGraceExpiresAt,
          revokedMfaCredentials: mfa.count,
          revokedDevices: devices.count,
          passwordReset: true,
        },
        createdAt: now,
      },
    });
    return { username: input.username, tenantSlug: input.tenantSlug, mfaGraceExpiresAt };
  });
}
