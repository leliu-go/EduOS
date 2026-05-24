import type { RoleKey } from "@/lib/rbac/permissions";

const tenantAccountManagerRoles = new Set<RoleKey>([
  "SUPER_ADMIN",
  "ORG_ADMIN",
  "CAMPUS_ADMIN",
  "ACADEMIC",
]);

export function canManageAccountRole(actorRole: RoleKey, targetRole: RoleKey) {
  if (tenantAccountManagerRoles.has(actorRole)) {
    return true;
  }

  return actorRole === "TEACHER" && targetRole === "STUDENT";
}

export function canUnlockAccount(actorRole: RoleKey) {
  return tenantAccountManagerRoles.has(actorRole);
}

export function canManageAccountLifecycle(actorRole: RoleKey) {
  return actorRole === "SUPER_ADMIN" || actorRole === "ORG_ADMIN";
}
