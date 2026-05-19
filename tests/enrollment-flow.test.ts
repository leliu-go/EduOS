import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { enrollmentFormSchema } from "../features/enrollments/enrollment-schema";
import { hasPermission } from "../lib/rbac/permissions";

describe("enrollment flow", () => {
  it("adds tenant-scoped Enrollment and CourseAccount models", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("model Enrollment");
    expect(schema).toContain("model CourseAccount");
    expect(schema).toContain("enrollments Enrollment[]");
    expect(schema).toContain("courseAccounts CourseAccount[]");
    expect(schema).toMatch(/studentId\s+String/);
    expect(schema).toMatch(/courseProductId\s+String/);
    expect(schema).toMatch(/classGroupId\s+String\?/);
    expect(schema).toMatch(/courseAccountId\s+String/);
    expect(schema).toMatch(/purchasedHours\s+Int/);
    expect(schema).toMatch(/model Enrollment[\s\S]*purchasedHours\s+Int/);
    expect(schema).toContain("@@unique([tenantId, studentId, courseProductId])");
    expect(schema).toContain("@@index([tenantId, status])");
  });

  it("validates enrollment form values", () => {
    expect(() =>
      enrollmentFormSchema.parse({
        studentId: "cm00000000000000000000001",
        courseProductId: "cm00000000000000000000002",
        classGroupId: "cm00000000000000000000003",
        purchasedHours: "48",
        enrolledAt: "2026-09-01",
        notes: "秋季班报名",
      }),
    ).not.toThrow();

    expect(() =>
      enrollmentFormSchema.parse({
        studentId: "bad-id",
        courseProductId: "cm00000000000000000000002",
        classGroupId: "",
        purchasedHours: "0",
        enrolledAt: "bad-date",
        notes: "",
      }),
    ).toThrow();
  });

  it("keeps enrollment mutations staff-only", () => {
    expect(hasPermission("ORG_ADMIN", "enrollments:manage")).toBe(true);
    expect(hasPermission("ACADEMIC", "enrollments:manage")).toBe(true);
    expect(hasPermission("STUDENT", "enrollments:manage")).toBe(false);
    expect(hasPermission("PARENT", "enrollments:manage")).toBe(false);
  });

  it("uses tenant-scoped enrollment action with CourseAccount upsert and audit logging", () => {
    const source = readFileSync(join(process.cwd(), "features/enrollments/actions.ts"), "utf8");

    expect(source).toContain('requirePermission("enrollments:manage"');
    expect(source).toContain("getEnrollmentFormValues");
    expect(source).toContain("currentUser.tenantId");
    expect(source).toContain("tx.studentProfile.findFirst");
    expect(source).toContain("tx.courseProduct.findFirst");
    expect(source).toContain("tx.classGroup.findFirst");
    expect(source).toContain("courseAccount.upsert");
    expect(source).toContain("enrollment.create");
    expect(source).toContain("classGroupStudent");
    expect(source).toContain("writeAuditLog");
  });

  it("reads staff enrollments and student-visible enrolled courses by current student user", () => {
    const source = readFileSync(join(process.cwd(), "features/enrollments/queries.ts"), "utf8");

    expect(source).toContain("getEnrollmentList");
    expect(source).toContain("prisma.enrollment.count");
    expect(source).toContain("skip");
    expect(source).toContain("take");
    expect(source).toContain("getStudentEnrolledCourses");
    expect(source).toContain("student: {");
    expect(source).toContain("userId");
    expect(source).toContain("courseProduct: {");
    expect(source).toContain("classGroup: true");
  });

  it("renders enrollment staff pages and student enrolled courses", () => {
    const staffPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/enrollments/page.tsx"),
      "utf8",
    );
    const studentPage = readFileSync(join(process.cwd(), "app/(mobile)/student/page.tsx"), "utf8");
    const loadingPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/enrollments/loading.tsx"),
      "utf8",
    );
    const errorPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/enrollments/error.tsx"),
      "utf8",
    );

    expect(staffPage).toContain("EnrollmentCreateDialog");
    expect(staffPage).toContain('name="q"');
    expect(staffPage).toContain("pageCount");
    expect(studentPage).toContain("getStudentEnrolledCourses");
    expect(loadingPage).toContain("LoadingState");
    expect(errorPage).toContain("ErrorState");
  });
});
