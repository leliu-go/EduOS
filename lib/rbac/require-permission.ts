import { redirect } from "next/navigation";

import { requireCurrentUser, type CurrentUser } from "@/lib/auth/current-user";
import { hasPermission, type Permission } from "@/lib/rbac/permissions";

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

  return currentUser;
}
