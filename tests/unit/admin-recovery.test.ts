import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  membership: { update: vi.fn() },
  userMfaCredential: { updateMany: vi.fn() },
  adminBackupDevice: { updateMany: vi.fn() },
  auditLog: { create: vi.fn(), findFirst: vi.fn() },
}));
vi.mock("../../lib/prisma", () => ({
  prisma: { ...db, $transaction: (callback: (tx: typeof db) => unknown) => callback(db) },
}));

import { adminRecoverySchema, recoverAdminAccount } from "../../lib/auth/admin-recovery";
import { getTemporaryMfaPolicy, isTemporaryMfaAccessActive } from "../../lib/mfa/temporary-access";
import { sessionSurvivesPasswordChange } from "../../lib/auth/session";

const now = new Date("2026-10-05T00:00:00Z");
const grant = { createdAt: now, afterJson: { mfaGraceExpiresAt: "2026-10-06T00:00:00Z" } };
const payload = {
  username: "qa-recovery-admin",
  tenantSlug: "qa-tenant",
  password: "QA-only-test-password",
  temporaryMfaHours: 24,
  confirmation: "RESET_ADMIN_ACCESS",
};

beforeEach(() => {
  vi.clearAllMocks();
  db.user.findUnique.mockResolvedValue({
    id: "qa-admin",
    memberships: [
      {
        id: "qa-member",
        tenantId: "qa-tenant-id",
        tenant: { slug: "qa-tenant", status: "ACTIVE" },
        role: { key: "ORG_ADMIN", status: "ACTIVE" },
      },
    ],
  });
  db.userMfaCredential.updateMany.mockResolvedValue({ count: 1 });
  db.adminBackupDevice.updateMany.mockResolvedValue({ count: 1 });
});

describe("temporary administrator recovery", () => {
  it("requires explicit confirmation and a bounded duration", () => {
    expect(adminRecoverySchema.safeParse({ ...payload, confirmation: "" }).success).toBe(false);
    expect(adminRecoverySchema.safeParse({ ...payload, temporaryMfaHours: 25 }).success).toBe(
      false,
    );
  });

  it("only grants unbound administrators at most 24 hours", () => {
    const input = {
      roleKey: "ORG_ADMIN" as const,
      enrollmentStatus: "not_enrolled" as const,
      grant,
      now,
    };
    expect(isTemporaryMfaAccessActive(input)).toBe(true);
    expect(isTemporaryMfaAccessActive({ ...input, roleKey: "TEACHER" })).toBe(false);
    expect(isTemporaryMfaAccessActive({ ...input, enrollmentStatus: "verified" })).toBe(false);
    expect(isTemporaryMfaAccessActive({ ...input, enrollmentStatus: "locked" })).toBe(false);
    expect(isTemporaryMfaAccessActive({ ...input, now: new Date("2026-10-06T00:00:00Z") })).toBe(
      false,
    );
    expect(isTemporaryMfaAccessActive({ ...input, grant: null })).toBe(false);
    expect(
      isTemporaryMfaAccessActive({
        ...input,
        grant: { ...grant, afterJson: { mfaGraceExpiresAt: "2026-10-07T00:00:00Z" } },
      }),
    ).toBe(false);
    expect(isTemporaryMfaAccessActive({ ...input, grant: { ...grant, afterJson: {} } })).toBe(
      false,
    );
  });

  it("scopes the recovery lookup by both tenant and user", async () => {
    db.auditLog.findFirst.mockResolvedValue(null);
    await expect(
      getTemporaryMfaPolicy({
        tenantId: "qa-tenant-id",
        userId: "qa-admin",
        roleKey: "ORG_ADMIN",
        enrollmentStatus: "not_enrolled",
      }),
    ).resolves.toBeUndefined();
    expect(db.auditLog.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: "qa-tenant-id",
          entityId: "qa-admin",
          OR: expect.arrayContaining([{ entityType: "user", action: "accounts.admin.recover" }]),
        }),
      }),
    );
  });

  it("resets one account, revokes old factors and devices, and audits without secrets", async () => {
    await recoverAdminAccount(payload);
    const update = db.user.update.mock.calls[0][0];
    expect(update.where).toEqual({ id: "qa-admin" });
    expect(update.data.passwordHash).toContain("pbkdf2_sha256");
    expect(update.data.passwordHash).not.toContain(payload.password);
    expect(db.userMfaCredential.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: "qa-tenant-id", userId: "qa-admin" },
        data: expect.objectContaining({
          status: "DISABLED",
          encryptedTotpSecret: "",
          backupCodeHash: null,
        }),
      }),
    );
    expect(db.adminBackupDevice.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: "qa-tenant-id", adminUserId: "qa-admin", status: "ACTIVE" },
      }),
    );
    expect(JSON.stringify(db.auditLog.create.mock.calls)).not.toContain(payload.password);
    expect(JSON.stringify(db.auditLog.create.mock.calls)).not.toContain(update.data.passwordHash);
  });

  it("refuses other tenants and non-admin targets without mutation", async () => {
    await expect(recoverAdminAccount({ ...payload, tenantSlug: "other" })).rejects.toThrow();
    expect(db.user.update).not.toHaveBeenCalled();
    db.user.findUnique.mockResolvedValue({
      id: "qa-student",
      memberships: [
        {
          id: "qa-member",
          tenantId: "qa-tenant-id",
          tenant: { slug: "qa-tenant", status: "ACTIVE" },
          role: { key: "STUDENT", status: "ACTIVE" },
        },
      ],
    });
    await expect(recoverAdminAccount(payload)).rejects.toThrow();
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("rejects sessions issued before a password reset, including legacy sessions", () => {
    expect(sessionSurvivesPasswordChange({ issuedAt: now.getTime() - 1 }, now)).toBe(false);
    expect(sessionSurvivesPasswordChange({}, now)).toBe(false);
    expect(sessionSurvivesPasswordChange({ issuedAt: now.getTime() + 1 }, now)).toBe(true);
    expect(sessionSurvivesPasswordChange({}, null)).toBe(true);
  });
});
