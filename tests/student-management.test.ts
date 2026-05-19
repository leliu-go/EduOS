import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { hasPermission } from "../lib/rbac/permissions";
import { studentFormSchema } from "../features/students/student-schema";

describe("student management", () => {
  it("adds a tenant-scoped StudentProfile model", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("model StudentProfile");
    expect(schema).toContain("tenantId");
    expect(schema).toContain("name");
    expect(schema).toContain("gender");
    expect(schema).toContain("birthday");
    expect(schema).toContain("grade");
    expect(schema).toContain("school");
    expect(schema).toContain("notes");
    expect(schema).toContain("@@index([tenantId, status])");
  });

  it("validates student form input before mutations", () => {
    expect(() =>
      studentFormSchema.parse({
        name: "李同学",
        gender: "FEMALE",
        birthday: "2012-09-01",
        grade: "初一",
        school: "第一中学",
        status: "ACTIVE",
        notes: "数学基础较好",
      }),
    ).not.toThrow();

    expect(() =>
      studentFormSchema.parse({
        name: "",
        gender: "",
        birthday: "not-a-date",
        grade: "",
        school: "",
        status: "ACTIVE",
        notes: "",
      }),
    ).toThrow();
  });

  it("limits student management to staff permissions", () => {
    expect(hasPermission("ACADEMIC", "students:manage")).toBe(true);
    expect(hasPermission("CAMPUS_ADMIN", "students:manage")).toBe(true);
    expect(hasPermission("STUDENT", "students:manage")).toBe(false);
    expect(hasPermission("PARENT", "students:manage")).toBe(false);
  });

  it("uses tenant-scoped server actions with audit logging", () => {
    const source = readFileSync(join(process.cwd(), "features/students/actions.ts"), "utf8");

    expect(source).toContain('requirePermission("students:manage"');
    expect(source).toContain("currentUser.tenantId");
    expect(source).toContain("writeAuditLog");
    expect(source).toContain("$transaction");
  });

  it("renders list, create dialog, detail, and route states", () => {
    const listPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/students/page.tsx"),
      "utf8",
    );
    const detailPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/students/[studentId]/page.tsx"),
      "utf8",
    );
    const loadingPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/students/loading.tsx"),
      "utf8",
    );
    const errorPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/students/error.tsx"),
      "utf8",
    );

    expect(listPage).toContain("StudentCreateDialog");
    expect(listPage).toContain("EmptyState");
    expect(listPage).toContain("search");
    expect(listPage).toContain("status");
    expect(detailPage).toContain("StudentEditDialog");
    expect(loadingPage).toContain("LoadingState");
    expect(errorPage).toContain("ErrorState");
  });
});
