import { generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  buildLoginOnlyBackupDevice,
  createDevicePublicKeyFingerprint,
  verifyDeviceChallengeSignature,
} from "../../lib/security/device-binding/admin-backup-device";

describe("admin backup device binding", () => {
  it("registers a new device as LOGIN_ONLY and does not persist private keys", () => {
    const device = buildLoginOnlyBackupDevice({
      tenantId: "tenant-a",
      adminUserId: "admin-a",
      deviceId: "device-a",
      deviceName: "Office PC",
      publicKey: "-----BEGIN PUBLIC KEY-----\ntest\n-----END PUBLIC KEY-----",
    });

    expect(device).toMatchObject({
      tenantId: "tenant-a",
      adminUserId: "admin-a",
      deviceId: "device-a",
      deviceName: "Office PC",
      deviceRole: "LOGIN_ONLY",
      status: "ACTIVE",
    });
    expect(JSON.stringify(device)).not.toContain("private");
    expect(device.publicKeyFingerprint).toMatch(/^sha256:/);
  });

  it("verifies a device private-key signature against the stored public key", () => {
    const { publicKey, privateKey } = generateKeyPairSync("ed25519");
    const publicKeyPem = publicKey.export({ format: "pem", type: "spki" }).toString();
    const challenge = "tenant-a:device-a:nonce-123";
    const signature = sign(null, Buffer.from(challenge, "utf8"), privateKey).toString("base64url");

    expect(createDevicePublicKeyFingerprint(publicKeyPem)).toMatch(/^sha256:/);
    expect(
      verifyDeviceChallengeSignature({
        publicKey: publicKeyPem,
        challenge,
        signature,
      }),
    ).toBe(true);
    expect(
      verifyDeviceChallengeSignature({
        publicKey: publicKeyPem,
        challenge,
        signature: `${signature}x`,
      }),
    ).toBe(false);
  });
});
