import type { RoleKey } from "@/lib/rbac/permissions";

export function getRoleLandingPath(roleKey: RoleKey) {
  switch (roleKey) {
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
      return "/student";
    case "PARENT":
      return "/parent";
    default:
      return "/dashboard";
  }
}
