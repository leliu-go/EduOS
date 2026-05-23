import { describe, expect, it } from "vitest";

import {
  createCoreBackupPackage,
  decryptLocalBackupPayload,
  encryptLocalBackupPayload,
  verifyCoreBackupPackage,
} from "../../lib/backup/backup-package-format";

describe("core backup package format", () => {
  it("creates a checksum-protected encrypted package envelope", () => {
    const backupPackage = createCoreBackupPackage({
      appVersion: "0.1.0",
      tenantId: "tenant-a",
      encryptedPayload: "encrypted-payload-only",
      recordCounts: {
        students: 2,
        payments: 3,
      },
      exportedAt: new Date("2026-05-23T10:00:00.000Z"),
    });

    expect(backupPackage).toMatchObject({
      schemaVersion: 1,
      appVersion: "0.1.0",
      tenantId: "tenant-a",
      encryptedPayload: "encrypted-payload-only",
      recordCounts: {
        students: 2,
        payments: 3,
      },
    });
    expect(backupPackage.checksum).toMatch(/^sha256:/);
    expect(verifyCoreBackupPackage(backupPackage)).toEqual({ valid: true });
    expect(
      verifyCoreBackupPackage({
        ...backupPackage,
        encryptedPayload: "tampered",
      }),
    ).toEqual({ valid: false, reason: "checksum_mismatch" });
  });

  it("encrypts and decrypts local payloads with a passphrase without plaintext leakage", async () => {
    const encrypted = await encryptLocalBackupPayload({
      payload: { students: [{ id: "student-a", name: "QA Student" }] },
      passphrase: "local-backup-passphrase-with-length",
      salt: "fixed-salt-for-test",
      iv: "fixed-iv-1234",
    });

    expect(encrypted.ciphertext).not.toContain("QA Student");
    await expect(
      decryptLocalBackupPayload({
        encryptedPayload: encrypted,
        passphrase: "local-backup-passphrase-with-length",
      }),
    ).resolves.toEqual({ students: [{ id: "student-a", name: "QA Student" }] });
  });
});
