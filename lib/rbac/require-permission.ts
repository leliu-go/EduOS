import { redirect } from "next/navigation";

import { requireCurrentUser, type CurrentUser } from "@/lib/auth/current-user";
import { hasPermission, type Permission } from "@/lib/rbac/permissions";
import { getPostPasswordMfaLoginDecision } from "@/lib/auth/mfa-login";
import { getMfaEnrollmentStatus } from "@/lib/mfa/mfa-status";
import { roleRequiresMfa } from "@/lib/mfa/mfa-policy";
import { getTemporaryMfaPolicy } from "@/lib/mfa/temporary-access";

export class PermissionDeniedError extends Error {
  constructor(
    readonly permission: Permission,
    readonly roleKey: string,
  ) {
    super(`Role ${roleKey} is not allowed to use permission ${permission}.`);
    this.name = "PermissionDeniedError";
  }
}

type RequirePermissionOptions = {
  currentUser?: CurrentUser;
  nextPath?: string;
  unauthorizedRedirectTo?: string;
};

function getSafeNextPath(nextPath: string | undefined) {
  return nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
    ? nextPath
    : "/dashboard";
}

async function enforceRequiredMfa(
  currentUser: CurrentUser,
  permission: Permission,
  nextPath?: string,
) {
  if (!roleRequiresMfa(currentUser.roleKey) || permission === "security:mfa:manage") {
    return;
  }

  if (currentUser.mfaVerifiedAt) {
    return;
  }

  const safeNextPath = getSafeNextPath(nextPath);
  const enrollmentStatus = await getMfaEnrollmentStatus({
    tenantId: currentUser.tenantId,
    userId: currentUser.id,
  });
  const decision = getPostPasswordMfaLoginDecision({
    roleKey: currentUser.roleKey,
    enrollmentStatus,
    sessionMfaVerified: Boolean(currentUser.mfaVerifiedAt),
    policy: await getTemporaryMfaPolicy({
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      roleKey: currentUser.roleKey,
      enrollmentStatus,
    }),
  });

  if (decision.action === "allow") {
    return;
  }

  if (decision.action === "enroll") {
    redirect(`/mfa/setup?next=${encodeURIComponent(safeNextPath)}`);
  }

  if (decision.action === "challenge") {
    redirect(`/mfa?next=${encodeURIComponent(safeNextPath)}`);
  }

  redirect("/login?error=mfa_locked");
}

export async function requirePermission(
  permission: Permission,
  options: RequirePermissionOptions = {},
) {
  const currentUser = options.currentUser ?? (await requireCurrentUser(options.nextPath));

  if (!hasPermission(currentUser.roleKey, permission)) {
    if (options.unauthorizedRedirectTo) {
      redirect(options.unauthorizedRedirectTo);
    }

    throw new PermissionDeniedError(permission, currentUser.roleKey);
  }

  await enforceRequiredMfa(currentUser, permission, options.nextPath);

  return currentUser;
}
