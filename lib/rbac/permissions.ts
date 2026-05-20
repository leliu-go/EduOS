export const roleKeys = [
  "SUPER_ADMIN",
  "ORG_ADMIN",
  "CAMPUS_ADMIN",
  "ACADEMIC",
  "FINANCE",
  "TEACHER",
  "STUDENT",
  "PARENT",
] as const;

export type RoleKey = (typeof roleKeys)[number];

export const permissions = [
  "route:dashboard",
  "route:admin",
  "route:scheduling",
  "route:finance",
  "route:teacher",
  "route:student",
  "route:parent",
  "campus:manage",
  "academicConfig:manage",
  "students:manage",
  "guardians:manage",
  "teachers:manage",
  "accounts:invite",
  "courses:manage",
  "classes:manage",
  "enrollments:manage",
  "scheduling:view",
  "scheduling:mutate",
  "attendance:view",
  "attendance:mutate",
  "courseConsumption:view",
  "courseConsumption:mutate",
  "resources:manage",
  "resources:viewOwn",
  "homework:manage",
  "homework:submit",
  "homework:correct",
  "lessonFeedback:manage",
  "mistakes:viewOwn",
  "mistakes:manage",
  "reports:institution:view",
  "finance:reports:view",
  "finance:mutate",
] as const;

export type Permission = (typeof permissions)[number];

function withoutPermissions(excludedPermissions: readonly Permission[]) {
  return permissions.filter((permission) => !excludedPermissions.includes(permission));
}

const tenantAdminPermissions = withoutPermissions([
  "route:teacher",
  "route:student",
  "route:parent",
]);

const staffDashboardPermissions = [
  "route:dashboard",
  "route:admin",
  "scheduling:view",
  "attendance:view",
  "courseConsumption:view",
  "reports:institution:view",
] as const satisfies readonly Permission[];

export const permissionMatrix = {
  SUPER_ADMIN: tenantAdminPermissions,
  ORG_ADMIN: tenantAdminPermissions,
  CAMPUS_ADMIN: [
    ...staffDashboardPermissions,
    "route:scheduling",
    "campus:manage",
    "academicConfig:manage",
    "students:manage",
    "guardians:manage",
    "teachers:manage",
    "accounts:invite",
    "courses:manage",
    "classes:manage",
    "enrollments:manage",
    "scheduling:mutate",
    "attendance:mutate",
    "courseConsumption:mutate",
    "resources:manage",
    "homework:manage",
    "homework:correct",
    "lessonFeedback:manage",
    "mistakes:manage",
  ],
  ACADEMIC: [
    ...staffDashboardPermissions,
    "route:scheduling",
    "students:manage",
    "academicConfig:manage",
    "guardians:manage",
    "teachers:manage",
    "courses:manage",
    "classes:manage",
    "enrollments:manage",
    "scheduling:mutate",
    "attendance:mutate",
    "courseConsumption:mutate",
    "resources:manage",
    "homework:manage",
    "homework:correct",
    "lessonFeedback:manage",
    "mistakes:manage",
  ],
  FINANCE: [
    "route:dashboard",
    "route:finance",
    "courseConsumption:view",
    "finance:reports:view",
    "finance:mutate",
  ],
  TEACHER: [
    "route:teacher",
    "scheduling:view",
    "attendance:view",
    "attendance:mutate",
    "resources:manage",
    "resources:viewOwn",
    "homework:manage",
    "homework:correct",
    "lessonFeedback:manage",
    "mistakes:manage",
  ],
  STUDENT: [
    "route:student",
    "scheduling:view",
    "attendance:view",
    "courseConsumption:view",
    "resources:viewOwn",
    "homework:submit",
    "mistakes:viewOwn",
  ],
  PARENT: [
    "route:parent",
    "scheduling:view",
    "attendance:view",
    "courseConsumption:view",
    "resources:viewOwn",
    "homework:submit",
    "mistakes:viewOwn",
  ],
} as const satisfies Record<RoleKey, readonly Permission[]>;

export function isRoleKey(roleKey: string): roleKey is RoleKey {
  return (roleKeys as readonly string[]).includes(roleKey);
}

export function hasPermission(roleKey: string, permission: Permission) {
  if (!isRoleKey(roleKey)) {
    return false;
  }

  const rolePermissions: readonly Permission[] = permissionMatrix[roleKey];

  return rolePermissions.includes(permission);
}
