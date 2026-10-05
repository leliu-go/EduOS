import { createHmac, timingSafeEqual } from "node:crypto";

import { isRoleKey, type RoleKey } from "@/lib/rbac/permissions";

export type AuthSessionPayload = {
  userId: string;
  tenantId: string;
  roleKey: RoleKey;
  expiresAt: number;
  issuedAt?: number;
  mfaVerifiedAt?: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production.");
  }

  return "eduos-local-development-auth-secret-change-me";
}

function encodeJson(value: AuthSessionPayload) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeJson(value: string) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AuthSessionPayload;
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function isSessionPayload(value: AuthSessionPayload) {
  return (
    typeof value.userId === "string" &&
    typeof value.tenantId === "string" &&
    typeof value.roleKey === "string" &&
    isRoleKey(value.roleKey) &&
    typeof value.expiresAt === "number" &&
    (value.issuedAt === undefined || (Number.isFinite(value.issuedAt) && value.issuedAt > 0)) &&
    (value.mfaVerifiedAt === undefined || typeof value.mfaVerifiedAt === "number")
  );
}

export function sessionHasCompletedMfa(payload: Pick<AuthSessionPayload, "mfaVerifiedAt">) {
  return typeof payload.mfaVerifiedAt === "number" && payload.mfaVerifiedAt > 0;
}

export function createSessionToken(payload: AuthSessionPayload, secret = getAuthSecret()) {
  const encodedPayload = encodeJson({ ...payload, issuedAt: payload.issuedAt ?? Date.now() });
  const signature = sign(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export function sessionSurvivesPasswordChange(
  payload: Pick<AuthSessionPayload, "issuedAt">,
  passwordChangedAt: Date | null,
) {
  return (
    !passwordChangedAt ||
    (typeof payload.issuedAt === "number" && payload.issuedAt >= passwordChangedAt.getTime())
  );
}

export function verifySessionToken(token: string, secret = getAuthSecret()) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || !safeEqual(sign(encodedPayload, secret), signature)) {
    return null;
  }

  try {
    const payload = decodeJson(encodedPayload);

    if (!isSessionPayload(payload) || payload.expiresAt <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
