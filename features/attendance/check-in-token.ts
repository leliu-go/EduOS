import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import QRCode from "qrcode";

type CheckInQrTokenPayload = {
  tenantId: string;
  scheduleId: string;
  nonce: string;
  expiresAt: number;
};

const defaultQrTtlMs = 10 * 60 * 1000;

function getCheckInQrSecret() {
  const secret = process.env.CHECK_IN_QR_SECRET ?? process.env.AUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("CHECK_IN_QR_SECRET or AUTH_SECRET is required in production.");
  }

  return "eduos-local-development-check-in-qr-secret-change-me";
}

function encodeJson(value: CheckInQrTokenPayload) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeJson(value: string) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as CheckInQrTokenPayload;
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function isTokenPayload(value: CheckInQrTokenPayload) {
  return (
    typeof value.tenantId === "string" &&
    typeof value.scheduleId === "string" &&
    typeof value.nonce === "string" &&
    value.nonce.length >= 32 &&
    typeof value.expiresAt === "number"
  );
}

export function createCheckInQrToken(
  input: { tenantId: string; scheduleId: string; now?: Date; ttlMs?: number },
  secret = getCheckInQrSecret(),
) {
  const now = input.now ?? new Date();
  const payload: CheckInQrTokenPayload = {
    tenantId: input.tenantId,
    scheduleId: input.scheduleId,
    nonce: randomBytes(24).toString("base64url"),
    expiresAt: now.getTime() + (input.ttlMs ?? defaultQrTtlMs),
  };
  const encodedPayload = encodeJson(payload);

  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function verifyCheckInQrToken(
  token: string,
  now = new Date(),
  secret = getCheckInQrSecret(),
) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || !safeEqual(sign(encodedPayload, secret), signature)) {
    return null;
  }

  try {
    const payload = decodeJson(encodedPayload);

    if (!isTokenPayload(payload) || payload.expiresAt <= now.getTime()) {
      return null;
    }

    return {
      tenantId: payload.tenantId,
      scheduleId: payload.scheduleId,
      nonce: payload.nonce,
    };
  } catch {
    return null;
  }
}

function getAppBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
}

export async function createScheduleCheckInQrCode(input: { tenantId: string; scheduleId: string }) {
  const token = createCheckInQrToken(input);
  const url = `${getAppBaseUrl()}/student/check-in/${encodeURIComponent(token)}`;
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 192,
  });

  return {
    token,
    url,
    dataUrl,
  };
}
