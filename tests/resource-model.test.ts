import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("resource model", () => {
  it("defines resource types and status enums", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("enum ResourceType");
    for (const type of ["PPT", "HANDOUT", "VIDEO", "AUDIO", "WORKSHEET", "ANSWER", "EXPLANATION"]) {
      expect(schema).toContain(type);
    }
    expect(schema).toContain("enum ResourceStatus");
    expect(schema).toContain("enum ResourcePermissionTarget");
  });

  it("creates a tenant-scoped Resource that can bind to course, class, or lesson", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toMatch(/model Resource[\s\S]*tenantId\s+String/);
    expect(schema).toMatch(/model Resource[\s\S]*resourceType\s+ResourceType/);
    expect(schema).toMatch(/model Resource[\s\S]*courseProductId\s+String\?/);
    expect(schema).toMatch(/model Resource[\s\S]*classGroupId\s+String\?/);
    expect(schema).toMatch(/model Resource[\s\S]*lessonId\s+String\?/);
    expect(schema).toMatch(/model Resource[\s\S]*permissions\s+ResourcePermission\[\]/);
    expect(schema).toContain("@@index([tenantId, resourceType])");
    expect(schema).toContain("@@index([tenantId, courseProductId])");
    expect(schema).toContain("@@index([tenantId, classGroupId])");
    expect(schema).toContain("@@index([tenantId, lessonId])");
  });

  it("creates explicit resource permissions for class, student, or role targets", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toMatch(/model ResourcePermission[\s\S]*target\s+ResourcePermissionTarget/);
    expect(schema).toMatch(/model ResourcePermission[\s\S]*resourceId\s+String/);
    expect(schema).toMatch(/model ResourcePermission[\s\S]*classGroupId\s+String\?/);
    expect(schema).toMatch(/model ResourcePermission[\s\S]*studentId\s+String\?/);
    expect(schema).toMatch(/model ResourcePermission[\s\S]*roleKey\s+RoleKey\?/);
    expect(schema).toMatch(/model ResourcePermission[\s\S]*canView\s+Boolean\s+@default\(true\)/);
    expect(schema).toContain("@@index([tenantId, resourceId])");
    expect(schema).toContain("@@index([tenantId, target])");
  });

  it("adds relations from tenant and learning objects", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toMatch(/model Tenant[\s\S]*resources\s+Resource\[\]/);
    expect(schema).toMatch(/model Tenant[\s\S]*resourcePermissions\s+ResourcePermission\[\]/);
    expect(schema).toMatch(/model CourseProduct[\s\S]*resources\s+Resource\[\]/);
    expect(schema).toMatch(/model ClassGroup[\s\S]*resources\s+Resource\[\]/);
    expect(schema).toMatch(/model Lesson[\s\S]*resources\s+Resource\[\]/);
    expect(schema).toMatch(
      /model StudentProfile[\s\S]*resourcePermissions\s+ResourcePermission\[\]/,
    );
  });
});
