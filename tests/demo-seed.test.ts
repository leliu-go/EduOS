import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { demoSeedConfig, demoUserPassword } from "../prisma/demo-seed-data";

describe("demo seed data", () => {
  it("defines the required EduOS demo tenant dataset", () => {
    expect(demoSeedConfig.tenant.slug).toBe("eduos-demo");
    expect(demoSeedConfig.campus.name).toBeTruthy();
    expect(demoSeedConfig.rooms).toHaveLength(2);

    expect(demoSeedConfig.users.map((user) => user.roleKey)).toEqual(
      expect.arrayContaining(["ORG_ADMIN", "ACADEMIC", "FINANCE", "TEACHER", "STUDENT", "PARENT"]),
    );
    expect(demoSeedConfig.teachers).toHaveLength(1);
    expect(demoSeedConfig.students.length).toBeGreaterThanOrEqual(2);
    expect(demoSeedConfig.guardians.length).toBeGreaterThanOrEqual(1);
    expect(demoSeedConfig.subjects.length).toBeGreaterThanOrEqual(1);
    expect(demoSeedConfig.grades.length).toBeGreaterThanOrEqual(1);
    expect(demoSeedConfig.courseProducts.length).toBeGreaterThanOrEqual(1);
    expect(demoSeedConfig.classGroups.length).toBeGreaterThanOrEqual(1);
    expect(demoSeedConfig.schedules.length).toBeGreaterThanOrEqual(2);
    expect(demoUserPassword.length).toBeGreaterThanOrEqual(8);
  });

  it("uses idempotent prisma writes and hashed demo passwords", () => {
    const source = readFileSync(join(process.cwd(), "prisma/seed.ts"), "utf8");

    expect(source).not.toContain("Seed placeholder");
    expect(source).toContain("hashPassword");
    expect(source).toContain("prisma.$transaction");
    expect(source).toContain("upsert");
    expect(source).toContain("tenantId_key");
    expect(source).toContain("tenantId_campusId_name");
    expect(source).toContain("tenantId_userId_roleId_campusId");
    expect(source).toContain("tenantId_studentId_guardianId");
    expect(source).toContain("tenantId_classGroupId_studentId");
  });
});
