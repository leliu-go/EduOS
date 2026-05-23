import {
  createCipheriv,
  createDecipheriv,
  createHash,
  pbkdf2,
  randomBytes,
} from "node:crypto";
import { promisify } from "node:util";

const pbkdf2Async = promisify(pbkdf2);

export type CoreBackupPackage = {
  schemaVersion: 1;
  appVersion: string;
  tenantId: string;
  exportedAt: string;
  recordCounts: Record<string, number>;
  checksum: string;
  encryptedPayload: string;
  signature?: string;
};

export type EncryptedLocalBackupPayload = {
  algorithm: "aes-256-gcm";
  kdf: "pbkdf2-sha256";
  iterations: number;
  salt: string;
  iv: string;
  authTag: string;
  ciphertext: string;
};

function checksumPackage(input: Omit<CoreBackupPackage, "checksum" | "signature">) {
  const canonical = JSON.stringify({
    schemaVersion: input.schemaVersion,
    appVersion: input.appVersion,
    tenantId: input.tenantId,
    exportedAt: input.exportedAt,
    recordCounts: input.recordCounts,
    encryptedPayload: input.encryptedPayload,
  });

  return `sha256:${createHash("sha256").update(canonical, "utf8").digest("base64url")}`;
}

function normalizeFixedBytes(value: string | undefined, length: number) {
  if (!value) {
    return randomBytes(length);
  }

  return createHash("sha256").update(value, "utf8").digest().subarray(0, length);
}

async function deriveBackupKey(passphrase: string, salt: Buffer, iterations: number) {
  if (passphrase.trim().length < 16) {
    throw new Error("Local backup passphrase must be at least 16 characters.");
  }

  return pbkdf2Async(passphrase, salt, iterations, 32, "sha256");
}

export function createCoreBackupPackage(input: {
  appVersion: string;
  tenantId: string;
  exportedAt: Date;
  recordCounts: Record<string, number>;
  encryptedPayload: string;
  signature?: string;
}): CoreBackupPackage {
  const unsignedPackage = {
    schemaVersion: 1,
    appVersion: input.appVersion,
    tenantId: input.tenantId,
    exportedAt: input.exportedAt.toISOString(),
    recordCounts: input.recordCounts,
    encryptedPayload: input.encryptedPayload,
  } as const;

  return {
    ...unsignedPackage,
    checksum: checksumPackage(unsignedPackage),
    ...(input.signature ? { signature: input.signature } : {}),
  };
}

export function verifyCoreBackupPackage(backupPackage: CoreBackupPackage) {
  const expectedChecksum = checksumPackage({
    schemaVersion: backupPackage.schemaVersion,
    appVersion: backupPackage.appVersion,
    tenantId: backupPackage.tenantId,
    exportedAt: backupPackage.exportedAt,
    recordCounts: backupPackage.recordCounts,
    encryptedPayload: backupPackage.encryptedPayload,
  });

  if (backupPackage.checksum !== expectedChecksum) {
    return { valid: false, reason: "checksum_mismatch" } as const;
  }

  return { valid: true } as const;
}

export async function encryptLocalBackupPayload(input: {
  payload: unknown;
  passphrase: string;
  salt?: string;
  iv?: string;
}): Promise<EncryptedLocalBackupPayload> {
  const iterations = 210_000;
  const salt = normalizeFixedBytes(input.salt, 16);
  const iv = normalizeFixedBytes(input.iv, 12);
  const key = await deriveBackupKey(input.passphrase, salt, iterations);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = JSON.stringify(input.payload);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return {
    algorithm: "aes-256-gcm",
    kdf: "pbkdf2-sha256",
    iterations,
    salt: salt.toString("base64url"),
    iv: iv.toString("base64url"),
    authTag: cipher.getAuthTag().toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
  };
}

export async function decryptLocalBackupPayload(input: {
  encryptedPayload: EncryptedLocalBackupPayload;
  passphrase: string;
}) {
  const salt = Buffer.from(input.encryptedPayload.salt, "base64url");
  const iv = Buffer.from(input.encryptedPayload.iv, "base64url");
  const key = await deriveBackupKey(
    input.passphrase,
    salt,
    input.encryptedPayload.iterations,
  );
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(Buffer.from(input.encryptedPayload.authTag, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(input.encryptedPayload.ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");

  return JSON.parse(plaintext) as unknown;
}
