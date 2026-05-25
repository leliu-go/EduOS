import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

export type EncryptedMfaSecret = {
  keyId: string;
  algorithm: "aes-256-gcm";
  iv: string;
  authTag: string;
  ciphertext: string;
};

export interface MfaSecretEncryptionProvider {
  readonly keyId: string;
  encrypt(plainTextSecret: string): Promise<EncryptedMfaSecret>;
  decrypt(encryptedSecret: EncryptedMfaSecret): Promise<string>;
}

export type BackupCodeHash = `mfa-bc-v1:${string}:${string}`;

function deriveAesKey(keyMaterial: string) {
  if (keyMaterial.trim().length < 16) {
    throw new Error("MFA encryption key material must be at least 16 characters.");
  }

  return createHash("sha256").update(keyMaterial, "utf8").digest();
}

function normalizeBackupCode(code: string) {
  return code.replace(/\s|-/g, "").toUpperCase();
}

export class LocalDevMfaEncryptionProvider implements MfaSecretEncryptionProvider {
  readonly keyId: string;
  private readonly key: Buffer;

  constructor(options: { keyId?: string; keyMaterial: string }) {
    this.keyId = options.keyId ?? "local-dev";
    this.key = deriveAesKey(options.keyMaterial);
  }

  async encrypt(plainTextSecret: string): Promise<EncryptedMfaSecret> {
    if (!plainTextSecret.trim()) {
      throw new Error("MFA TOTP secret is required.");
    }

    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(plainTextSecret, "utf8"),
      cipher.final(),
    ]);

    return {
      keyId: this.keyId,
      algorithm: "aes-256-gcm",
      iv: iv.toString("base64url"),
      authTag: cipher.getAuthTag().toString("base64url"),
      ciphertext: ciphertext.toString("base64url"),
    };
  }

  async decrypt(encryptedSecret: EncryptedMfaSecret): Promise<string> {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      this.key,
      Buffer.from(encryptedSecret.iv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(encryptedSecret.authTag, "base64url"));

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedSecret.ciphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  }
}

export function createLocalDevMfaEncryptionProviderFromEnv(
  environment: Record<string, string | undefined> = process.env,
) {
  const keyMaterial = environment.MFA_TOTP_SECRET_ENCRYPTION_KEY;

  if (!keyMaterial) {
    return null;
  }

  return new LocalDevMfaEncryptionProvider({
    keyId: environment.MFA_ENCRYPTION_KEY_ID || "local-dev",
    keyMaterial,
  });
}

export function hashBackupCode(
  code: string,
  pepper: string,
  salt = randomBytes(16).toString("base64url"),
): BackupCodeHash {
  const normalizedCode = normalizeBackupCode(code);

  if (!normalizedCode) {
    throw new Error("Backup code is required.");
  }

  if (pepper.trim().length < 16) {
    throw new Error("MFA backup code pepper must be at least 16 characters.");
  }

  const digest = createHmac("sha256", pepper)
    .update(salt)
    .update(":")
    .update(normalizedCode)
    .digest("base64url");

  return `mfa-bc-v1:${salt}:${digest}`;
}

export function verifyBackupCode(code: string, storedHash: BackupCodeHash, pepper: string) {
  const [, salt, expectedDigest] = storedHash.split(":");
  const actual = hashBackupCode(code, pepper, salt).split(":")[2];
  const actualBuffer = Buffer.from(actual, "base64url");
  const expectedBuffer = Buffer.from(expectedDigest, "base64url");

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

export function serializeEncryptedMfaSecret(encryptedSecret: EncryptedMfaSecret) {
  return JSON.stringify(encryptedSecret);
}

export function parseEncryptedMfaSecret(value: string): EncryptedMfaSecret {
  const parsed = JSON.parse(value) as Partial<EncryptedMfaSecret>;

  if (
    parsed.algorithm !== "aes-256-gcm" ||
    typeof parsed.keyId !== "string" ||
    typeof parsed.iv !== "string" ||
    typeof parsed.authTag !== "string" ||
    typeof parsed.ciphertext !== "string"
  ) {
    throw new Error("Invalid encrypted MFA secret payload.");
  }

  return {
    keyId: parsed.keyId,
    algorithm: parsed.algorithm,
    iv: parsed.iv,
    authTag: parsed.authTag,
    ciphertext: parsed.ciphertext,
  };
}
