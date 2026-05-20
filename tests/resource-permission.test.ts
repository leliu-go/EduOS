import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("resource permission", () => {
  it("queries only student-visible resources opened to enrolled course or class", () => {
    const source = readFileSync(join(process.cwd(), "features/resources/queries.ts"), "utf8");

    expect(source).toContain("getStudentVisibleResources");
    expect(source).toContain("getStudentResourceDetail");
    expect(source).toContain("getStudentVisibleResourceWhere");
    expect(source).toContain("permissions: {");
    expect(source).toContain("canView: true");
    expect(source).toContain('target: "CLASS_GROUP"');
    expect(source).toContain('target: "STUDENT"');
    expect(source).toContain('roleKey: "STUDENT"');
    expect(source).toContain("enrollments: {");
    expect(source).toContain('status: "ACTIVE"');
    expect(source).toContain("student: {");
    expect(source).toContain("userId");
  });

  it("keeps teacher resource library scoped to assigned resources", () => {
    const source = readFileSync(join(process.cwd(), "features/resources/queries.ts"), "utf8");

    expect(source).toContain("getTeacherResourceLibrary");
    expect(source).toContain("primaryTeacher");
    expect(source).toContain("teacherUserId");
    expect(source).toContain("lesson: { teacher:");
  });

  it("renders student resource list and blocks unauthorized detail access", () => {
    const listPath = join(process.cwd(), "app/(mobile)/student/resources/page.tsx");
    const detailPath = join(process.cwd(), "app/(mobile)/student/resources/[resourceId]/page.tsx");

    expect(existsSync(listPath)).toBe(true);
    expect(existsSync(detailPath)).toBe(true);
    if (!existsSync(listPath) || !existsSync(detailPath)) {
      return;
    }

    const listPage = readFileSync(listPath, "utf8");
    const detailPage = readFileSync(detailPath, "utf8");

    expect(listPage).toContain('requirePermission("route:student"');
    expect(listPage).toContain("getStudentVisibleResources");
    expect(detailPage).toContain('requirePermission("route:student"');
    expect(detailPage).toContain("getStudentResourceDetail");
    expect(detailPage).toContain('redirect("/unauthorized")');
  });

  it("adds loading/error states and e2e protection for student resource URLs", () => {
    const files = [
      "app/(mobile)/student/resources/loading.tsx",
      "app/(mobile)/student/resources/error.tsx",
    ];

    for (const file of files) {
      expect(existsSync(join(process.cwd(), file))).toBe(true);
    }

    expect(
      readFileSync(join(process.cwd(), "app/(mobile)/student/resources/loading.tsx"), "utf8"),
    ).toContain("LoadingState");
    expect(
      readFileSync(join(process.cwd(), "app/(mobile)/student/resources/error.tsx"), "utf8"),
    ).toContain("ErrorState");
    const e2eSource = readFileSync(join(process.cwd(), "tests/e2e/auth.spec.ts"), "utf8");

    expect(e2eSource).toContain("/student/resources");
    expect(e2eSource).toContain("/student/resources/sample-resource");
  });
});
