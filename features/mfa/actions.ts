"use server";

import { randomBytes } from "node:crypto";

import { redirect } from "next/navigation";

import { getRoleLandingPath } from "@/lib/auth/landing-path";
import { setAuthSession, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session-cookie";
import {
  createLocalDevMfaEncryptionProviderFromEnv,
  parseEncryptedMfaSecret,
  serializeEncryptedMfaSecret,
} from "@/lib/mfa/mfa-crypto";
import { prepareMfaEnrollment, writeMfaAuditLog } from "@/lib/mfa/mfa-service";
import { generateTotpSecret, verifyTotpCode } from "@/lib/mfa/totp";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac/permissions";
import { requireCurrentUser, type CurrentUser } from "@/lib/auth/current-user";

const mfaLockAttemptLimit = 5;
const mfaLockMs = 5 * 60 * 1000;

function getFormDataString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function normalizeNextPath(nextPath: string, currentUser: CurrentUser) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return getRoleLandingPath(currentUser.roleKey);
  }

  return nextPath;
}

function getReturnTo(formData: FormData) {
  return getFormDataString(formData, "returnTo") === "/mfa/setup"
    ? "/mfa/setup"
    : "/dashboard/settings/security/mfa";
}

function redirectToMfaSettings(error: string, nextPath: string, returnTo = "/dashboard/settings/security/mfa"): never {
  const params = new URLSearchParams({ error });

  if (nextPath) {
    params.set("next", nextPath);
  }

  redirect(`${returnTo}?${params.toString()}`);
}

function redirectToMfaChallenge(error: string, nextPath: string): never {
  const params = new URLSearchParams({ error });

  if (nextPath) {
    params.set("next", nextPath);
  }

  redirect(`/mfa?${params.toString()}`);
}

function getMfaRuntime() {
  const encryptionProvider = createLocalDevMfaEncryptionProviderFromEnv(process.env);
  const backupCodePepper = process.env.MFA_BACKUP_CODE_PEPPER;

  if (!encryptionProvider || !backupCodePepper) {
    return null;
  }

  return {
    encryptionProvider,
    backupCodePepper,
  };
}

function generateBackupCodes(count = 8) {
  return Array.from({ length: count }, () => {
    const value = randomBytes(5).toString("hex").toUpperCase();

    return `${value.slice(0, 5)}-${value.slice(5)}`;
  });
}

type MfaRuntime = NonNullable<ReturnType<typeof getMfaRuntime>>;

async function requireMfaManageUser(nextPath: string) {
  const currentUser = await requireCurrentUser("/dashboard/settings/security/mfa");

  if (!hasPermission(currentUser.roleKey, "security:mfa:manage")) {
    redirect("/unauthorized");
  }

  return {
    currentUser,
    nextPath: normalizeNextPath(nextPath, currentUser),
  };
}

async function applyFailedMfaAttempt(input: {
  credentialId: string;
  tenantId: string;
  userId: string;
  failedAttemptCount: number;
  source: "enrollment" | "challenge";
}) {
  const nextFailedAttemptCount = input.failedAttemptCount + 1;
  const shouldLock = nextFailedAttemptCount >= mfaLockAttemptLimit;

  await prisma.userMfaCredential.update({
    where: {
      id: input.credentialId,
    },
    data: {
      failedAttemptCount: shouldLock ? 0 : nextFailedAttemptCount,
      lockedUntil: shouldLock ? new Date(Date.now() + mfaLockMs) : null,
    },
  });

  await writeMfaAuditLog({
    tenantId: input.tenantId,
    actorUserId: input.userId,
    targetUserId: input.userId,
    action: "mfa.challenge.failed",
    reason: input.source,
    metadata: {
      source: input.source,
      locked: shouldLock,
    },
  });
}

async function createPendingMfaEnrollment(input: {
  currentUser: CurrentUser;
  runtime: MfaRuntime;
  rebind: boolean;
}) {
  const secret = generateTotpSecret();
  const backupCodes = generateBackupCodes();
  const enrollment = await prepareMfaEnrollment({
    tenantId: input.currentUser.tenantId,
    userId: input.currentUser.id,
    plainTextTotpSecret: secret,
    backupCodes,
    backupCodePepper: input.runtime.backupCodePepper,
    encryptionProvider: input.runtime.encryptionProvider,
  });

  await prisma.userMfaCredential.upsert({
    where: {
      tenantId_userId_provider: {
        tenantId: input.currentUser.tenantId,
        userId: input.currentUser.id,
        provider: "totp",
      },
    },
    create: {
      tenantId: enrollment.tenantId,
      userId: enrollment.userId,
      provider: enrollment.provider,
      status: enrollment.status,
      encryptedTotpSecret: serializeEncryptedMfaSecret(enrollment.encryptedTotpSecret),
      totpSecretKeyId: enrollment.totpSecretKeyId,
      backupCodeHash: JSON.stringify(enrollment.backupCodeHashes),
      failedAttemptCount: 0,
      lockedUntil: null,
    },
    update: {
      status: enrollment.status,
      encryptedTotpSecret: serializeEncryptedMfaSecret(enrollment.encryptedTotpSecret),
      totpSecretKeyId: enrollment.totpSecretKeyId,
      backupCodeHash: JSON.stringify(enrollment.backupCodeHashes),
      failedAttemptCount: 0,
      lockedUntil: null,
      lastVerifiedAt: null,
    },
  });

  await writeMfaAuditLog({
    tenantId: input.currentUser.tenantId,
    actorUserId: input.currentUser.id,
    targetUserId: input.currentUser.id,
    action: "mfa.enrollment.started",
    metadata: {
      provider: "totp",
      rebind: input.rebind,
    },
  });
}

export async function startMfaEnrollmentAction(formData: FormData) {
  const { currentUser, nextPath } = await requireMfaManageUser(getFormDataString(formData, "next"));
  const returnTo = getReturnTo(formData);
  const runtime = getMfaRuntime();

  if (!runtime) {
    redirectToMfaSettings("missing_config", nextPath, returnTo);
  }

  const existingCredential = await prisma.userMfaCredential.findUnique({
    where: {
      tenantId_userId_provider: {
        tenantId: currentUser.tenantId,
        userId: currentUser.id,
        provider: "totp",
      },
    },
    select: {
      status: true,
    },
  });

  if (existingCredential?.status === "VERIFIED") {
    redirectToMfaSettings("already_enabled", nextPath, returnTo);
  }

  await createPendingMfaEnrollment({ currentUser, runtime, rebind: false });

  redirect(`${returnTo}?mfa=pending&next=${encodeURIComponent(nextPath)}`);
}

export async function rebindMfaEnrollmentAction(formData: FormData) {
  const { currentUser, nextPath } = await requireMfaManageUser(getFormDataString(formData, "next"));
  const returnTo = "/dashboard/settings/security/mfa";
  const runtime = getMfaRuntime();

  if (!runtime) {
    redirectToMfaSettings("missing_config", nextPath, returnTo);
  }

  if (!currentUser.mfaVerifiedAt) {
    redirect(`/mfa?next=${encodeURIComponent(returnTo)}`);
  }

  if (getFormDataString(formData, "confirmRebind") !== "yes") {
    redirectToMfaSettings("confirm_rebind_required", nextPath, returnTo);
  }

  const existingCredential = await prisma.userMfaCredential.findUnique({
    where: {
      tenantId_userId_provider: {
        tenantId: currentUser.tenantId,
        userId: currentUser.id,
        provider: "totp",
      },
    },
    select: {
      status: true,
    },
  });

  if (existingCredential?.status !== "VERIFIED") {
    redirectToMfaSettings("rebind_not_enabled", nextPath, returnTo);
  }

  await createPendingMfaEnrollment({ currentUser, runtime, rebind: true });
  await setAuthSession({
    userId: currentUser.id,
    tenantId: currentUser.tenantId,
    roleKey: currentUser.roleKey,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  });

  redirect(`${returnTo}?mfa=pending&next=${encodeURIComponent(nextPath)}`);
}

export async function verifyMfaEnrollmentAction(formData: FormData) {
  const { currentUser, nextPath } = await requireMfaManageUser(getFormDataString(formData, "next"));
  const returnTo = getReturnTo(formData);
  const token = getFormDataString(formData, "token");
  const runtime = getMfaRuntime();

  if (!runtime) {
    redirectToMfaSettings("missing_config", nextPath, returnTo);
  }

  const credential = await prisma.userMfaCredential.findUnique({
    where: {
      tenantId_userId_provider: {
        tenantId: currentUser.tenantId,
        userId: currentUser.id,
        provider: "totp",
      },
    },
    select: {
      id: true,
      status: true,
      encryptedTotpSecret: true,
      failedAttemptCount: true,
      lockedUntil: true,
    },
  });

  if (!credential) {
    redirectToMfaSettings("not_started", nextPath, returnTo);
  }

  if (credential.lockedUntil && credential.lockedUntil > new Date()) {
    redirectToMfaSettings("locked", nextPath, returnTo);
  }

  const secret = await runtime.encryptionProvider.decrypt(
    parseEncryptedMfaSecret(credential.encryptedTotpSecret),
  );
  const validToken = verifyTotpCode({ secret, token });

  if (!validToken) {
    await applyFailedMfaAttempt({
      credentialId: credential.id,
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      failedAttemptCount: credential.failedAttemptCount,
      source: "enrollment",
    });

    redirectToMfaSettings("invalid_token", nextPath, returnTo);
  }

  await prisma.userMfaCredential.update({
    where: {
      id: credential.id,
    },
    data: {
      status: "VERIFIED",
      failedAttemptCount: 0,
      lockedUntil: null,
      lastVerifiedAt: new Date(),
    },
  });

  await writeMfaAuditLog({
    tenantId: currentUser.tenantId,
    actorUserId: currentUser.id,
    targetUserId: currentUser.id,
    action: "mfa.enrollment.verified",
    metadata: {
      provider: "totp",
    },
  });

  await setAuthSession({
    userId: currentUser.id,
    tenantId: currentUser.tenantId,
    roleKey: currentUser.roleKey,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    mfaVerifiedAt: Date.now(),
  });

  redirect(nextPath);
}

export async function verifyMfaChallengeAction(formData: FormData) {
  const currentUser = await requireCurrentUser("/mfa");
  const nextPath = normalizeNextPath(getFormDataString(formData, "next"), currentUser);
  const token = getFormDataString(formData, "token");
  const runtime = getMfaRuntime();

  if (!runtime) {
    redirectToMfaChallenge("missing_config", nextPath);
  }

  const credential = await prisma.userMfaCredential.findUnique({
    where: {
      tenantId_userId_provider: {
        tenantId: currentUser.tenantId,
        userId: currentUser.id,
        provider: "totp",
      },
    },
    select: {
      id: true,
      status: true,
      encryptedTotpSecret: true,
      failedAttemptCount: true,
      lockedUntil: true,
    },
  });

  if (!credential || credential.status !== "VERIFIED") {
    redirectToMfaChallenge("not_enabled", nextPath);
  }

  if (credential.lockedUntil && credential.lockedUntil > new Date()) {
    redirectToMfaChallenge("locked", nextPath);
  }

  const secret = await runtime.encryptionProvider.decrypt(
    parseEncryptedMfaSecret(credential.encryptedTotpSecret),
  );

  if (!verifyTotpCode({ secret, token })) {
    await applyFailedMfaAttempt({
      credentialId: credential.id,
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      failedAttemptCount: credential.failedAttemptCount,
      source: "challenge",
    });

    redirectToMfaChallenge("invalid_token", nextPath);
  }

  await prisma.userMfaCredential.update({
    where: {
      id: credential.id,
    },
    data: {
      failedAttemptCount: 0,
      lockedUntil: null,
      lastVerifiedAt: new Date(),
    },
  });

  await setAuthSession({
    userId: currentUser.id,
    tenantId: currentUser.tenantId,
    roleKey: currentUser.roleKey,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    mfaVerifiedAt: Date.now(),
  });

  redirect(nextPath);
}
