import type { RoleKey } from "@/lib/rbac/permissions";

export type ResourceFileActor = {
  tenantId: string;
  roleKey: RoleKey;
  userId: string;
};

export type ResourceFileScope = {
  tenantId: string;
  ownerTeacherUserId?: string | null;
  studentUserIds?: readonly string[];
  guardianUserIds?: readonly string[];
  guardianStudentUserIds?: readonly string[];
};

const tenantStaffRoles = new Set<RoleKey>(["SUPER_ADMIN", "ORG_ADMIN", "CAMPUS_ADMIN", "ACADEMIC"]);

export function canAccessResourceFile(actor: ResourceFileActor, resource: ResourceFileScope) {
  if (actor.tenantId !== resource.tenantId) {
    return false;
  }

  if (tenantStaffRoles.has(actor.roleKey)) {
    return true;
  }

  if (actor.roleKey === "TEACHER") {
    return resource.ownerTeacherUserId === actor.userId;
  }

  if (actor.roleKey === "STUDENT") {
    return Boolean(resource.studentUserIds?.includes(actor.userId));
  }

  if (actor.roleKey === "PARENT") {
    return Boolean(
      resource.guardianUserIds?.includes(actor.userId) &&
        resource.guardianStudentUserIds &&
        resource.guardianStudentUserIds.length > 0,
    );
  }

  return false;
}
