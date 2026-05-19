import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { teacherFormSchema } from "../features/teachers/teacher-schema";
import { hasPermission } from "../lib/rbac/permissions";

describe("teacher management", () => {
  it("adds a tenant-scoped TeacherProfile model", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("model TeacherProfile");
    expect(schema).toContain("tenantId");
    expect(schema).toContain("name");
    expect(schema).toContain("phone");
    expect(schema).toContain("email");
    expect(schema).toContain("subjects");
    expect(schema).toContain("grades");
    expect(schema).toContain("availableTimeNotes");
    expect(schema).toContain("qualificationFileName");
    expect(schema).toContain("@@index([tenantId, status])");
  });

  it("validates teacher form input before mutations", () => {
    expect(() =>
      teacherFormSchema.parse({
        name: "王老师",
        phone: "13900000000",
        email: "teacher@example.com",
        subjects: "数学,物理",
        grades: "初一,初二",
        status: "ACTIVE",
        availableTimeNotes: "周一至周五晚间",
        qualificationFileName: "teacher-cert.pdf",
        notes: "擅长小班课",
      }),
    ).not.toThrow();

    expect(() =>
      teacherFormSchema.parse({
        name: "",
        phone: "",
        email: "bad-email",
        subjects: "",
        grades: "",
        status: "ACTIVE",
        availableTimeNotes: "",
        qualificationFileName: "",
        notes: "",
      }),
    ).toThrow();
  });

  it("keeps teacher management staff-only", () => {
    expect(hasPermission("ACADEMIC", "teachers:manage")).toBe(true);
    expect(hasPermission("CAMPUS_ADMIN", "teachers:manage")).toBe(true);
    expect(hasPermission("TEACHER", "teachers:manage")).toBe(false);
    expect(hasPermission("STUDENT", "teachers:manage")).toBe(false);
  });

  it("uses tenant-scoped teacher actions with audit logging", () => {
    const source = readFileSync(join(process.cwd(), "features/teachers/actions.ts"), "utf8");

    expect(source).toContain('requirePermission("teachers:manage"');
    expect(source).toContain("currentUser.tenantId");
    expect(source).toContain("$transaction");
    expect(source).toContain("writeAuditLog");
  });

  it("queries teacher portal profile by the signed-in user only", () => {
    const source = readFileSync(join(process.cwd(), "features/teachers/queries.ts"), "utf8");

    expect(source).toContain("getTeacherProfileForUser");
    expect(source).toContain("tenantId");
    expect(source).toContain("userId");
  });

  it("renders teacher list, create dialog, detail, and route states", () => {
    const listPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/teachers/page.tsx"),
      "utf8",
    );
    const detailPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/teachers/[teacherId]/page.tsx"),
      "utf8",
    );
    const loadingPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/teachers/loading.tsx"),
      "utf8",
    );
    const errorPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/teachers/error.tsx"),
      "utf8",
    );

    expect(listPage).toContain("TeacherCreateDialog");
    expect(listPage).toContain("EmptyState");
    expect(detailPage).toContain("TeacherEditDialog");
    expect(loadingPage).toContain("LoadingState");
    expect(errorPage).toContain("ErrorState");
  });
});
