import { createHash, verify as verifySignature } from "node:crypto";

export type AdminBackupDeviceRole =
  | "LOGIN_ONLY"
  | "BACKUP_AUTHORIZED"
  | "PRIMARY_BACKUP"
  | "STANDBY_BACKUP";

export type AdminBackupDeviceStatus = "ACTIVE" | "REVOKED" | "LOST" | "REPLACED";

export type LoginOnlyBackupDevice = {
  tenantId: string;
  adminUserId: string;
  deviceId: string;
  deviceName: string;
  publicKey: string;
  publicKeyFingerprint: string;
  deviceRole: "LOGIN_ONLY";
  status: "ACTIVE";
};

export function createDevicePublicKeyFingerprint(publicKey: string) {
  const digest = createHash("sha256").update(publicKey, "utf8").digest("base64url");

  return `sha256:${digest}`;
}

export function buildLoginOnlyBackupDevice(input: {
  tenantId: string;
  adminUserId: string;
  deviceId: string;
  deviceName: string;
  publicKey: string;
}): LoginOnlyBackupDevice {
  return {
    tenantId: input.tenantId,
    adminUserId: input.adminUserId,
    deviceId: input.deviceId,
    deviceName: input.deviceName,
    publicKey: input.publicKey,
    publicKeyFingerprint: createDevicePublicKeyFingerprint(input.publicKey),
    deviceRole: "LOGIN_ONLY",
    status: "ACTIVE",
  };
}

export function verifyDeviceChallengeSignature(input: {
  publicKey: string;
  challenge: string;
  signature: string;
}) {
  try {
    return verifySignature(
      null,
      Buffer.from(input.challenge, "utf8"),
      input.publicKey,
      Buffer.from(input.signature, "base64url"),
    );
  } catch {
    return false;
  }
}
