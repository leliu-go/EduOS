import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("lesson resource binding", () => {
  it("queries lesson resources for the assigned teacher and visible student", () => {
    const source = readFileSync(join(process.cwd(), "features/resources/queries.ts"), "utf8");

    expect(source).toContain("getTeacherLessonResources");
    expect(source).toContain("getStudentLessonResources");
    expect(source).toContain("lessonId");
    expect(source).toContain("teacher: {");
    expect(source).toContain("userId");
    expect(source).toContain("getStudentVisibleResourceWhere");
    expect(source).toContain('status: "ACTIVE"');
    expect(source).toContain("canView: true");
  });

  it("renders teacher and student lesson resource pages with states", () => {
    const teacherPagePath = join(process.cwd(), "app/(mobile)/teacher/lessons/[lessonId]/page.tsx");
    const studentPagePath = join(
      process.cwd(),
      "app/(mobile)/student/lessons/[lessonId]/resources/page.tsx",
    );
    const stateFiles = [
      "app/(mobile)/teacher/lessons/[lessonId]/loading.tsx",
      "app/(mobile)/teacher/lessons/[lessonId]/error.tsx",
      "app/(mobile)/student/lessons/[lessonId]/resources/loading.tsx",
      "app/(mobile)/student/lessons/[lessonId]/resources/error.tsx",
    ];

    expect(existsSync(teacherPagePath)).toBe(true);
    expect(existsSync(studentPagePath)).toBe(true);
    for (const file of stateFiles) {
      expect(existsSync(join(process.cwd(), file))).toBe(true);
    }

    if (!existsSync(teacherPagePath) || !existsSync(studentPagePath)) {
      return;
    }

    const teacherPage = readFileSync(teacherPagePath, "utf8");
    const studentPage = readFileSync(studentPagePath, "utf8");

    expect(teacherPage).toContain('requirePermission("resources:manage"');
    expect(teacherPage).toContain("getTeacherLessonResources");
    expect(teacherPage).toContain("ResourceCreateDialog");
    expect(studentPage).toContain('requirePermission("route:student"');
    expect(studentPage).toContain("getStudentLessonResources");
    expect(studentPage).toContain("EmptyState");
    for (const file of stateFiles) {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      expect(source).toMatch(/LoadingState|ErrorState/);
    }
  });

  it("links lesson resource pages from mobile timetables and protects the routes", () => {
    const teacherHome = readFileSync(join(process.cwd(), "app/(mobile)/teacher/page.tsx"), "utf8");
    const studentHome = readFileSync(join(process.cwd(), "app/(mobile)/student/page.tsx"), "utf8");
    const e2eSource = readFileSync(join(process.cwd(), "tests/e2e/auth.spec.ts"), "utf8");

    expect(teacherHome).toContain("/teacher/lessons/");
    expect(studentHome).toContain("/student/lessons/");
    expect(studentHome).toContain("/resources");
    expect(e2eSource).toContain("/teacher/lessons/sample-lesson");
    expect(e2eSource).toContain("/student/lessons/sample-lesson/resources");
  });
});
