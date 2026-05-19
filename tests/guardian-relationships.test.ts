import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { guardianBindingSchema } from "../features/guardians/guardian-schema";
import { hasPermission } from "../lib/rbac/permissions";

describe("guardian relationships", () => {
  it("adds tenant-scoped guardian and student guardian models", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("model GuardianProfile");
    expect(schema).toContain("model StudentGuardian");
    expect(schema).toContain("studentId");
    expect(schema).toContain("guardianId");
    expect(schema).toContain("relationship");
    expect(schema).toContain("@@unique([tenantId, studentId, guardianId])");
    expect(schema).toContain("@@index([tenantId, guardianId])");
  });

  it("validates guardian binding input", () => {
    expect(() =>
      guardianBindingSchema.parse({
        studentId: "clxstudent0000000000000001",
        name: "李妈妈",
        phone: "13800000000",
        email: "parent@example.com",
        relationship: "MOTHER",
        isPrimary: "on",
      }),
    ).not.toThrow();

    expect(() =>
      guardianBindingSchema.parse({
        studentId: "bad-id",
        name: "",
        phone: "",
        email: "not-email",
        relationship: "MOTHER",
      }),
    ).toThrow();
  });

  it("keeps guardian management staff-only", () => {
    expect(hasPermission("ACADEMIC", "guardians:manage")).toBe(true);
    expect(hasPermission("CAMPUS_ADMIN", "guardians:manage")).toBe(true);
    expect(hasPermission("PARENT", "guardians:manage")).toBe(false);
    expect(hasPermission("STUDENT", "guardians:manage")).toBe(false);
  });

  it("uses tenant-scoped binding action with audit logging", () => {
    const source = readFileSync(join(process.cwd(), "features/guardians/actions.ts"), "utf8");

    expect(source).toContain('requirePermission("guardians:manage"');
    expect(source).toContain("currentUser.tenantId");
    expect(source).toContain("$transaction");
    expect(source).toContain("writeAuditLog");
  });

  it("queries parent-visible students only through StudentGuardian", () => {
    const source = readFileSync(join(process.cwd(), "features/guardians/queries.ts"), "utf8");

    expect(source).toContain("guardian: {");
    expect(source).toContain("userId: parentUserId");
    expect(source).toContain("tenantId");
    expect(source).toContain("studentId");
  });
});
