import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  classGroupFormSchema,
  classGroupStudentFormSchema,
} from "../features/classes/class-group-schema";
import { hasPermission } from "../lib/rbac/permissions";

describe("class group management", () => {
  it("adds tenant-scoped ClassGroup and class roster models", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("model ClassGroup");
    expect(schema).toContain("model ClassGroupStudent");
    expect(schema).toContain("classGroups ClassGroup[]");
    expect(schema).toMatch(/courseProductId\s+String/);
    expect(schema).toMatch(/primaryTeacherId\s+String/);
    expect(schema).toMatch(/campusId\s+String/);
    expect(schema).toMatch(/capacity\s+Int/);
    expect(schema).toMatch(/startsAt\s+DateTime/);
    expect(schema).toMatch(/endsAt\s+DateTime/);
    expect(schema).toContain("@@index([tenantId, status])");
    expect(schema).toContain("@@unique([tenantId, classGroupId, studentId])");
  });

  it("validates class group and roster forms", () => {
    expect(() =>
      classGroupFormSchema.parse({
        name: "初二数学 A 班",
        courseProductId: "cm00000000000000000000001",
        primaryTeacherId: "cm00000000000000000000002",
        campusId: "cm00000000000000000000003",
        capacity: "16",
        status: "ACTIVE",
        startsAt: "2026-09-01",
        endsAt: "2027-01-15",
      }),
    ).not.toThrow();
    expect(() =>
      classGroupStudentFormSchema.parse({
        classGroupId: "cm00000000000000000000004",
        studentId: "cm00000000000000000000005",
        confirmCapacityOverride: "on",
      }),
    ).not.toThrow();

    expect(() =>
      classGroupFormSchema.parse({
        name: "",
        courseProductId: "bad-id",
        primaryTeacherId: "cm00000000000000000000002",
        campusId: "cm00000000000000000000003",
        capacity: "0",
        status: "ACTIVE",
        startsAt: "2027-01-15",
        endsAt: "2026-09-01",
      }),
    ).toThrow();
  });

  it("keeps class group mutation staff-only", () => {
    expect(hasPermission("ORG_ADMIN", "classes:manage")).toBe(true);
    expect(hasPermission("ACADEMIC", "classes:manage")).toBe(true);
    expect(hasPermission("TEACHER", "classes:manage")).toBe(false);
    expect(hasPermission("STUDENT", "classes:manage")).toBe(false);
  });

  it("uses tenant-scoped class actions, capacity warnings, and audit logging", () => {
    const source = readFileSync(join(process.cwd(), "features/classes/actions.ts"), "utf8");

    expect(source).toContain('requirePermission("classes:manage"');
    expect(source).toContain("getClassGroupFormValues");
    expect(source).toContain("currentUser.tenantId");
    expect(source).toContain("tx.courseProduct.findFirst");
    expect(source).toContain("tx.teacherProfile.findFirst");
    expect(source).toContain("tx.campus.findFirst");
    expect(source).toContain("confirmCapacityOverride");
    expect(source).toContain("capacity_warning");
    expect(source).toContain("deleteClassGroupAction");
    expect(source).toContain('status: "ARCHIVED"');
    expect(source).toContain('action: "classGroup.delete"');
    expect(source).toContain("classGroupStudent.create");
    expect(source).toContain("classGroupStudent.delete");
    expect(source).toContain("writeAuditLog");
  });

  it("reads staff class groups by tenant and teacher class groups by teacher user", () => {
    const source = readFileSync(join(process.cwd(), "features/classes/queries.ts"), "utf8");

    expect(source).toContain("getClassGroupList");
    expect(source).toContain("tenantId");
    expect(source).toContain('not: "ARCHIVED"');
    expect(source).toContain("courseProduct: true");
    expect(source).toContain("primaryTeacher: true");
    expect(source).toContain("campus: true");
    expect(source).toContain("getTeacherClassGroups");
    expect(source).toContain("primaryTeacher: {");
    expect(source).toContain("userId");
  });

  it("renders staff and teacher class group pages with route states", () => {
    const listPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/classes/page.tsx"),
      "utf8",
    );
    const detailPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/classes/[classGroupId]/page.tsx"),
      "utf8",
    );
    const teacherPage = readFileSync(
      join(process.cwd(), "app/(mobile)/teacher/classes/page.tsx"),
      "utf8",
    );
    const loadingPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/classes/loading.tsx"),
      "utf8",
    );
    const errorPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/classes/error.tsx"),
      "utf8",
    );

    expect(listPage).toContain("ClassGroupCreateDialog");
    expect(listPage).toContain("ClassGroupDeleteForm");
    expect(detailPage).toContain("ClassGroupEditDialog");
    expect(detailPage).toContain("ClassGroupDeleteForm");
    expect(detailPage).toContain("ClassGroupStudentAddDialog");
    expect(detailPage).toContain("ClassGroupStudentRemoveForm");
    expect(teacherPage).toContain("getTeacherClassGroups");
    expect(loadingPage).toContain("LoadingState");
    expect(errorPage).toContain("ErrorState");
  });
});
