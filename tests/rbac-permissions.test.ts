import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import type { CurrentUser } from "../lib/auth/current-user";
import { PermissionDeniedError, requirePermission } from "../lib/rbac/require-permission";
import { hasPermission, permissionMatrix, roleKeys } from "../lib/rbac/permissions";

const baseUser: CurrentUser = {
  id: "user_1",
  name: "测试用户",
  email: "user@example.com",
  tenantId: "tenant_1",
  tenantName: "示例机构",
  tenantSlug: "demo",
  campusId: null,
  roleId: "role_1",
  roleKey: "ORG_ADMIN",
};

function userWithRole(roleKey: CurrentUser["roleKey"]): CurrentUser {
  return {
    ...baseUser,
    roleKey,
  };
}

describe("RBAC permissions", () => {
  it("defines a permission matrix for every product role", () => {
    expect(Object.keys(permissionMatrix)).toEqual(roleKeys);
  });

  it("keeps student users out of teacher, admin, and finance areas", () => {
    expect(hasPermission("STUDENT", "route:student")).toBe(true);
    expect(hasPermission("STUDENT", "route:teacher")).toBe(false);
    expect(hasPermission("STUDENT", "route:dashboard")).toBe(false);
    expect(hasPermission("STUDENT", "finance:reports:view")).toBe(false);
  });

  it("keeps staff dashboard access separate from role-specific portals", () => {
    expect(hasPermission("ORG_ADMIN", "route:dashboard")).toBe(true);
    expect(hasPermission("ORG_ADMIN", "route:student")).toBe(false);
    expect(hasPermission("ORG_ADMIN", "route:teacher")).toBe(false);
    expect(hasPermission("ORG_ADMIN", "route:parent")).toBe(false);
  });

  it("prevents teachers from accessing finance reports", () => {
    expect(hasPermission("TEACHER", "route:teacher")).toBe(true);
    expect(hasPermission("TEACHER", "finance:reports:view")).toBe(false);
  });

  it("prevents finance users from mutating schedules unless explicitly allowed", () => {
    expect(hasPermission("FINANCE", "finance:reports:view")).toBe(true);
    expect(hasPermission("FINANCE", "scheduling:mutate")).toBe(false);
  });

  it("adds productization permissions without broadening role boundaries", () => {
    expect(hasPermission("ORG_ADMIN", "security:policy:manage")).toBe(true);
    expect(hasPermission("ORG_ADMIN", "security:mfa:enforce")).toBe(true);
    expect(hasPermission("ORG_ADMIN", "activities:manage")).toBe(true);
    expect(hasPermission("ORG_ADMIN", "version:view")).toBe(true);

    expect(hasPermission("CAMPUS_ADMIN", "activities:manage")).toBe(true);
    expect(hasPermission("CAMPUS_ADMIN", "security:policy:manage")).toBe(false);

    expect(hasPermission("TEACHER", "activities:progress:view")).toBe(true);
    expect(hasPermission("TEACHER", "activities:manage")).toBe(false);

    expect(hasPermission("STUDENT", "resources:download")).toBe(true);
    expect(hasPermission("STUDENT", "activities:viewOwn")).toBe(true);
    expect(hasPermission("STUDENT", "activities:checkIn")).toBe(true);
    expect(hasPermission("STUDENT", "activities:manage")).toBe(false);
    expect(hasPermission("STUDENT", "security:mfa:enforce")).toBe(false);

    expect(hasPermission("PARENT", "activities:viewOwn")).toBe(true);
    expect(hasPermission("PARENT", "activities:checkIn")).toBe(false);

    expect(hasPermission("FINANCE", "security:mfa:manage")).toBe(true);
    expect(hasPermission("FINANCE", "security:policy:manage")).toBe(false);
    expect(hasPermission("FINANCE", "activities:manage")).toBe(false);
  });

  it("documents the upgraded role permission matrix", () => {
    const matrix = readFileSync("docs/PERMISSION_MATRIX.md", "utf8");

    expect(matrix).toContain("resources:download");
    expect(matrix).toContain("activities:checkIn");
    expect(matrix).toContain("security:mfa:enforce");
    expect(matrix).toContain("version:view");
  });

  it("requires permissions on the server using the current user role", async () => {
    await expect(
      requirePermission("finance:reports:view", {
        currentUser: userWithRole("TEACHER"),
      }),
    ).rejects.toBeInstanceOf(PermissionDeniedError);

    await expect(
      requirePermission("finance:reports:view", {
        currentUser: userWithRole("FINANCE"),
      }),
    ).resolves.toMatchObject({
      roleKey: "FINANCE",
      tenantId: "tenant_1",
    });
  });
});
