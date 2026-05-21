import { describe, expect, it, vi } from "vitest";

import { getPostPasswordMfaLoginDecision } from "../../lib/auth/mfa-login";
import {
  createLocalDevMfaEncryptionProviderFromEnv,
  hashBackupCode,
  LocalDevMfaEncryptionProvider,
  verifyBackupCode,
} from "../../lib/mfa/mfa-crypto";
import { prepareMfaEnrollment, writeMfaAuditLog } from "../../lib/mfa/mfa-service";

describe("MFA low-risk implementation", () => {
  it("encrypts TOTP secrets with the local development provider without exposing plaintext", async () => {
    const provider = new LocalDevMfaEncryptionProvider({
      keyId: "local-test",
      keyMaterial: "local-test-key-material-32-bytes",
    });

    const encrypted = await provider.encrypt("JBSWY3DPEHPK3PXP");

    expect(encrypted.keyId).toBe("local-test");
    expect(encrypted.algorithm).toBe("aes-256-gcm");
    expect(encrypted.ciphertext).not.toContain("JBSWY3DPEHPK3PXP");
    await expect(provider.decrypt(encrypted)).resolves.toBe("JBSWY3DPEHPK3PXP");
  });

  it("loads local MFA encryption only from environment placeholders", () => {
    expect(createLocalDevMfaEncryptionProviderFromEnv({})).toBeNull();
    expect(
      createLocalDevMfaEncryptionProviderFromEnv({
        MFA_ENCRYPTION_KEY_ID: "staging-local",
        MFA_TOTP_SECRET_ENCRYPTION_KEY: "staging-local-key-material",
      })?.keyId,
    ).toBe("staging-local");
  });

  it("hashes backup codes and verifies them without storing plaintext", () => {
    const hash = hashBackupCode("ab12-cd34", "pepper-material-with-enough-length", "fixedsalt");

    expect(hash).toMatch(/^mfa-bc-v1:fixedsalt:/);
    expect(hash).not.toContain("AB12CD34");
    expect(verifyBackupCode("AB12 CD34", hash, "pepper-material-with-enough-length")).toBe(true);
    expect(verifyBackupCode("WRONG", hash, "pepper-material-with-enough-length")).toBe(false);
  });

  it("prepares enrollment data with encrypted secrets and hashed backup codes", async () => {
    const provider = new LocalDevMfaEncryptionProvider({
      keyId: "local-test",
      keyMaterial: "local-test-key-material-32-bytes",
    });

    const enrollment = await prepareMfaEnrollment({
      tenantId: "tenant-a",
      userId: "user-a",
      plainTextTotpSecret: "JBSWY3DPEHPK3PXP",
      backupCodes: ["code-one", "code-two"],
      backupCodePepper: "pepper-material-with-enough-length",
      encryptionProvider: provider,
    });

    expect(enrollment.status).toBe("PENDING_VERIFICATION");
    expect(enrollment.totpSecretKeyId).toBe("local-test");
    expect(enrollment.encryptedTotpSecret.ciphertext).not.toContain("JBSWY3DPEHPK3PXP");
    expect(enrollment.backupCodeHashes).toHaveLength(2);
    expect(enrollment.backupCodeHashes[0]).not.toContain("code-one");
  });

  it("writes MFA operations through tenant-scoped audit logs", async () => {
    const create = vi.fn(async () => ({}));

    await writeMfaAuditLog(
      {
        tenantId: "tenant-a",
        actorUserId: "admin-a",
        targetUserId: "admin-a",
        action: "mfa.enrollment.started",
        metadata: { provider: "totp" },
      },
      { auditLog: { create } },
    );

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: "tenant-a",
        actorUserId: "admin-a",
        action: "mfa.enrollment.started",
        entityType: "UserMfaCredential",
        entityId: "admin-a",
      }),
    });
  });

  it("returns MFA login decisions after password authentication", () => {
    expect(
      getPostPasswordMfaLoginDecision({
        roleKey: "ORG_ADMIN",
        enrollmentStatus: "not_enrolled",
      }),
    ).toEqual({ action: "enroll", reason: "enrollment_required" });

    expect(
      getPostPasswordMfaLoginDecision({
        roleKey: "FINANCE",
        enrollmentStatus: "verified",
      }),
    ).toEqual({ action: "challenge", reason: "verification_required" });

    expect(
      getPostPasswordMfaLoginDecision({
        roleKey: "STUDENT",
        enrollmentStatus: "not_enrolled",
      }),
    ).toEqual({ action: "allow", reason: "role_not_required" });
  });
});
