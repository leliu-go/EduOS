import { hasPermission, type RoleKey } from "@/lib/rbac/permissions";
import {
  canAccessResourceFile,
  type ResourceFileScope,
} from "@/lib/resources/resource-access-policy";

import type { ActivityStatus } from "./activity-schema";

export type ActivityActor = {
  tenantId: string;
  roleKey: RoleKey;
  userId: string;
};

export type ActivityVisibilityScope = {
  tenantId: string;
  status: ActivityStatus;
  teacherUserIds?: readonly string[];
  assignedStudentUserIds?: readonly string[];
  assignedGuardianUserIds?: readonly string[];
};

function isPublished(activity: ActivityVisibilityScope) {
  return activity.status === "PUBLISHED";
}

function sameTenant(actor: ActivityActor, activity: ActivityVisibilityScope | ResourceFileScope) {
  return actor.tenantId === activity.tenantId;
}

export function canManageActivity(actor: ActivityActor, activityTenantId: string) {
  return actor.tenantId === activityTenantId && hasPermission(actor.roleKey, "activities:manage");
}

export function canViewActivity(actor: ActivityActor, activity: ActivityVisibilityScope) {
  if (!sameTenant(actor, activity)) {
    return false;
  }

  if (hasPermission(actor.roleKey, "activities:manage")) {
    return true;
  }

  if (actor.roleKey === "TEACHER") {
    return Boolean(
      hasPermission(actor.roleKey, "activities:progress:view") &&
        activity.teacherUserIds?.includes(actor.userId),
    );
  }

  if (actor.roleKey === "STUDENT") {
    return Boolean(isPublished(activity) && activity.assignedStudentUserIds?.includes(actor.userId));
  }

  if (actor.roleKey === "PARENT") {
    return Boolean(isPublished(activity) && activity.assignedGuardianUserIds?.includes(actor.userId));
  }

  return false;
}

export function canSubmitWordCheckIn(actor: ActivityActor, activity: ActivityVisibilityScope) {
  return Boolean(
    actor.roleKey === "STUDENT" &&
      sameTenant(actor, activity) &&
      isPublished(activity) &&
      hasPermission(actor.roleKey, "activities:checkIn") &&
      activity.assignedStudentUserIds?.includes(actor.userId),
  );
}

export function canAttachResourceToActivity(actor: ActivityActor, resource: ResourceFileScope) {
  return (
    actor.tenantId === resource.tenantId &&
    hasPermission(actor.roleKey, "activities:manage") &&
    hasPermission(actor.roleKey, "resources:download") &&
    canAccessResourceFile(actor, resource)
  );
}

export function canUseActivityResource(
  actor: ActivityActor,
  activity: ActivityVisibilityScope,
  resource: ResourceFileScope,
) {
  return (
    sameTenant(actor, activity) &&
    sameTenant(actor, resource) &&
    canViewActivity(actor, activity) &&
    hasPermission(actor.roleKey, "resources:download") &&
    canAccessResourceFile(actor, resource)
  );
}
