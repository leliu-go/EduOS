import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { courseProductFormSchema } from "../features/courses/course-product-schema";
import { hasPermission } from "../lib/rbac/permissions";

describe("course product management", () => {
  it("adds a tenant-scoped CourseProduct model linked to subject and grade", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("model CourseProduct");
    expect(schema).toContain("courseProducts CourseProduct[]");
    expect(schema).toMatch(/subjectId\s+String/);
    expect(schema).toMatch(/gradeId\s+String/);
    expect(schema).toMatch(/courseType\s+CourseType/);
    expect(schema).toMatch(/classType\s+ClassType/);
    expect(schema).toMatch(/totalHours\s+Int/);
    expect(schema).toMatch(/price\s+Decimal/);
    expect(schema).toContain("@@unique([tenantId, name])");
    expect(schema).toContain("@@index([tenantId, status])");
    expect(schema).toContain("@@index([tenantId, subjectId, gradeId])");
  });

  it("validates course product form values", () => {
    expect(() =>
      courseProductFormSchema.parse({
        name: "初二数学秋季班",
        subjectId: "cm00000000000000000000001",
        gradeId: "cm00000000000000000000002",
        courseType: "SMALL_GROUP",
        classType: "OFFLINE",
        totalHours: "48",
        price: "9600",
        description: "适合初二同步提升",
        status: "ACTIVE",
      }),
    ).not.toThrow();

    expect(() =>
      courseProductFormSchema.parse({
        name: "",
        subjectId: "bad-id",
        gradeId: "cm00000000000000000000002",
        courseType: "SMALL_GROUP",
        classType: "OFFLINE",
        totalHours: "0",
        price: "-1",
        description: "",
        status: "ACTIVE",
      }),
    ).toThrow();
  });

  it("keeps course product management staff-only", () => {
    expect(hasPermission("ORG_ADMIN", "courses:manage")).toBe(true);
    expect(hasPermission("ACADEMIC", "courses:manage")).toBe(true);
    expect(hasPermission("STUDENT", "courses:manage")).toBe(false);
    expect(hasPermission("PARENT", "courses:manage")).toBe(false);
  });

  it("uses tenant-scoped course actions with validation and audit logging", () => {
    const source = readFileSync(join(process.cwd(), "features/courses/actions.ts"), "utf8");

    expect(source).toContain('requirePermission("courses:manage"');
    expect(source).toContain("getCourseProductFormValues");
    expect(source).toContain("currentUser.tenantId");
    expect(source).toContain("tx.subject.findFirst");
    expect(source).toContain("tx.grade.findFirst");
    expect(source).toContain("$transaction");
    expect(source).toContain("writeAuditLog");
    expect(source).toContain("courseProduct.create");
    expect(source).toContain("courseProduct.update");
  });

  it("reads course products by tenant and includes subject and grade", () => {
    const source = readFileSync(join(process.cwd(), "features/courses/queries.ts"), "utf8");

    expect(source).toContain("tenantId");
    expect(source).toContain("prisma.courseProduct.findMany");
    expect(source).toContain("prisma.courseProduct.count");
    expect(source).toContain("skip");
    expect(source).toContain("take");
    expect(source).toContain("subject: true");
    expect(source).toContain("grade: true");
  });

  it("renders course product management pages and route states", () => {
    const listPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/courses/page.tsx"),
      "utf8",
    );
    const detailPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/courses/[courseProductId]/page.tsx"),
      "utf8",
    );
    const loadingPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/courses/loading.tsx"),
      "utf8",
    );
    const errorPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/courses/error.tsx"),
      "utf8",
    );

    expect(listPage).toContain("CourseProductCreateDialog");
    expect(listPage).toContain('name="q"');
    expect(listPage).toContain('name="status"');
    expect(listPage).toContain("pageCount");
    expect(detailPage).toContain("CourseProductEditDialog");
    expect(detailPage).toContain("CourseProductArchiveForm");
    expect(loadingPage).toContain("LoadingState");
    expect(errorPage).toContain("ErrorState");
  });
});
