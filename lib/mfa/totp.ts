import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const defaultPeriodSeconds = 30;
const defaultDigits = 6;

function base32Encode(buffer: Buffer) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += base32Alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += base32Alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(secret: string) {
  const normalizedSecret = secret.replace(/\s|=/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const character of normalizedSecret) {
    const index = base32Alphabet.indexOf(character);

    if (index === -1) {
      throw new Error("TOTP secret must be base32 encoded.");
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function hotp(secret: string, counter: number, digits: number) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac("sha1", base32Decode(secret)).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 10 ** digits).padStart(digits, "0");
}

function safeCodeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function generateTotpSecret(bytes = 20) {
  return base32Encode(randomBytes(bytes));
}

export function generateTotpCode(input: {
  secret: string;
  now?: Date;
  digits?: number;
  periodSeconds?: number;
}) {
  const now = input.now ?? new Date();
  const digits = input.digits ?? defaultDigits;
  const periodSeconds = input.periodSeconds ?? defaultPeriodSeconds;
  const counter = Math.floor(now.getTime() / 1000 / periodSeconds);

  return hotp(input.secret, counter, digits);
}

export function verifyTotpCode(input: {
  secret: string;
  token: string;
  now?: Date;
  digits?: number;
  periodSeconds?: number;
  window?: number;
}) {
  const normalizedToken = input.token.replace(/\s/g, "");
  const digits = input.digits ?? defaultDigits;

  if (!new RegExp(`^\\d{${digits}}$`).test(normalizedToken)) {
    return false;
  }

  const now = input.now ?? new Date();
  const periodSeconds = input.periodSeconds ?? defaultPeriodSeconds;
  const allowedWindow = input.window ?? 1;
  const currentCounter = Math.floor(now.getTime() / 1000 / periodSeconds);

  for (let offset = -allowedWindow; offset <= allowedWindow; offset += 1) {
    if (safeCodeEqual(hotp(input.secret, currentCounter + offset, digits), normalizedToken)) {
      return true;
    }
  }

  return false;
}

export function createTotpProvisioningUri(input: {
  issuer: string;
  accountName: string;
  secret: string;
  digits?: number;
  periodSeconds?: number;
}) {
  const issuer = input.issuer || "EduOS";
  const label = `${issuer}:${input.accountName}`;
  const params = new URLSearchParams({
    secret: input.secret,
    issuer,
    algorithm: "SHA1",
    digits: String(input.digits ?? defaultDigits),
    period: String(input.periodSeconds ?? defaultPeriodSeconds),
  });

  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}
