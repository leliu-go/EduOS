import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

import {
  createAuthorizedResourceDownloadUrl,
  type ResourceDownloadScope,
} from "../../lib/resources/download-authorization";
import { canAccessResourceFile } from "../../lib/resources/resource-access-policy";
import { hasPermission, type RoleKey } from "../../lib/rbac/permissions";
import type { StorageProvider } from "../../lib/storage/StorageProvider";

const tenantResource: ResourceDownloadScope = {
  tenantId: "tenant-a",
  provider: "aliyun-oss",
  bucket: "eduos-prod-resources-studygo",
  objectKey: "tenant-a/resources/word-book.pdf",
  ownerTeacherUserId: "teacher-a",
  studentUserIds: ["student-a"],
  guardianUserIds: ["parent-a"],
  guardianStudentUserIds: ["student-a"],
};

function actor(roleKey: RoleKey, userId: string, tenantId = "tenant-a") {
  return { roleKey, userId, tenantId };
}

function createProvider(): StorageProvider {
  return {
    kind: "aliyun-oss",
    bucket: "eduos-prod-resources-studygo",
    putObject: vi.fn(),
    createSignedDownloadUrl: vi.fn(async () => ({
      url: "https://signed.example.test/resource",
      expiresAt: new Date("2026-05-21T08:00:00.000Z"),
    })),
    createDownloadUrl: vi.fn(async () => ({
      url: "https://signed.example.test/resource",
      expiresAt: new Date("2026-05-21T08:00:00.000Z"),
    })),
  };
}

describe("productized RBAC boundaries", () => {
  it("keeps students limited to their own learning surfaces", () => {
    expect(hasPermission("STUDENT", "route:student")).toBe(true);
    expect(hasPermission("STUDENT", "resources:download")).toBe(true);
    expect(hasPermission("STUDENT", "activities:checkIn")).toBe(true);
    expect(hasPermission("STUDENT", "homework:submit")).toBe(true);

    expect(hasPermission("STUDENT", "route:teacher")).toBe(false);
    expect(hasPermission("STUDENT", "route:dashboard")).toBe(false);
    expect(hasPermission("STUDENT", "resources:manage")).toBe(false);
    expect(hasPermission("STUDENT", "finance:reports:view")).toBe(false);
    expect(hasPermission("STUDENT", "security:policy:manage")).toBe(false);
  });

  it("keeps parents scoped to guardian-bound children", () => {
    expect(hasPermission("PARENT", "route:parent")).toBe(true);
    expect(hasPermission("PARENT", "resources:download")).toBe(true);
    expect(hasPermission("PARENT", "activities:viewOwn")).toBe(true);

    expect(hasPermission("PARENT", "activities:checkIn")).toBe(false);
    expect(hasPermission("PARENT", "route:teacher")).toBe(false);
    expect(hasPermission("PARENT", "route:dashboard")).toBe(false);
    expect(hasPermission("PARENT", "finance:reports:view")).toBe(false);
  });

  it("keeps teachers away from finance and tenant-wide activity administration", () => {
    expect(hasPermission("TEACHER", "route:teacher")).toBe(true);
    expect(hasPermission("TEACHER", "resources:manage")).toBe(true);
    expect(hasPermission("TEACHER", "activities:progress:view")).toBe(true);

    expect(hasPermission("TEACHER", "activities:manage")).toBe(false);
    expect(hasPermission("TEACHER", "finance:mutate")).toBe(false);
    expect(hasPermission("TEACHER", "route:finance")).toBe(false);
    expect(hasPermission("TEACHER", "security:policy:manage")).toBe(false);
  });

  it("keeps finance users out of teaching resources, homework, and activity mutations", () => {
    expect(hasPermission("FINANCE", "route:finance")).toBe(true);
    expect(hasPermission("FINANCE", "finance:reports:view")).toBe(true);
    expect(hasPermission("FINANCE", "security:mfa:manage")).toBe(true);

    expect(hasPermission("FINANCE", "resources:manage")).toBe(false);
    expect(hasPermission("FINANCE", "resources:download")).toBe(false);
    expect(hasPermission("FINANCE", "homework:manage")).toBe(false);
    expect(hasPermission("FINANCE", "homework:correct")).toBe(false);
    expect(hasPermission("FINANCE", "activities:manage")).toBe(false);
  });

  it("enforces tenant and ownership boundaries before signing resource downloads", async () => {
    const provider = createProvider();

    await expect(
      createAuthorizedResourceDownloadUrl(actor("STUDENT", "student-a"), tenantResource, provider),
    ).resolves.toMatchObject({ allowed: true });

    await expect(
      createAuthorizedResourceDownloadUrl(actor("STUDENT", "student-b"), tenantResource, provider),
    ).resolves.toEqual({ allowed: false, reason: "forbidden" });

    await expect(
      createAuthorizedResourceDownloadUrl(actor("TEACHER", "teacher-b"), tenantResource, provider),
    ).resolves.toEqual({ allowed: false, reason: "forbidden" });

    await expect(
      createAuthorizedResourceDownloadUrl(actor("ORG_ADMIN", "admin-a", "tenant-b"), tenantResource, provider),
    ).resolves.toEqual({ allowed: false, reason: "forbidden" });

    expect(provider.createSignedDownloadUrl).toHaveBeenCalledTimes(1);
  });

  it("allows admins only inside their tenant and parents only when explicitly bound", () => {
    expect(canAccessResourceFile(actor("ORG_ADMIN", "admin-a"), tenantResource)).toBe(true);
    expect(canAccessResourceFile(actor("ORG_ADMIN", "admin-a", "tenant-b"), tenantResource)).toBe(false);
    expect(canAccessResourceFile(actor("PARENT", "parent-a"), tenantResource)).toBe(true);
    expect(canAccessResourceFile(actor("PARENT", "parent-b"), tenantResource)).toBe(false);
  });

  it("keeps protected resource and activity operations behind server-side authorization", () => {
    const resourceActions = readFileSync("features/resources/actions.ts", "utf8");
    const activityPolicy = readFileSync("features/activities/activity-policy.ts", "utf8");

    expect(resourceActions).toContain('requirePermission("resources:manage"');
    expect(activityPolicy).toContain('hasPermission(actor.roleKey, "activities:manage")');
    expect(activityPolicy).toContain('hasPermission(actor.roleKey, "activities:checkIn")');
  });
});
