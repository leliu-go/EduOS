import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("error handling polish", () => {
  it("provides global error and not-found pages with clear recovery actions", () => {
    const globalErrorPath = join(rootDir, "app/global-error.tsx");
    const notFoundPath = join(rootDir, "app/not-found.tsx");

    expect(existsSync(globalErrorPath)).toBe(true);
    expect(existsSync(notFoundPath)).toBe(true);

    const globalError = readFileSync(globalErrorPath, "utf8");
    const notFound = readFileSync(notFoundPath, "utf8");

    expect(globalError).toContain('"use client"');
    expect(globalError).toContain("<html");
    expect(globalError).toContain("<body");
    expect(globalError).toContain("ErrorState");
    expect(globalError).toContain("reset");
    expect(globalError).toContain("digest");
    expect(globalError).toContain("返回首页");

    expect(notFound).toContain("页面不存在");
    expect(notFound).toContain("返回首页");
    expect(notFound).toContain('href="/login"');
  });

  it("mounts the toast host with accessible notification styling", () => {
    const layout = readProjectFile("app/layout.tsx");
    const toaster = readProjectFile("components/ui/sonner.tsx");

    expect(layout).toContain("Toaster");
    expect(toaster).toContain("richColors");
    expect(toaster).toContain("closeButton");
    expect(toaster).toContain("containerAriaLabel");
  });

  it("keeps protected detail routes wrapped with loading and error states", () => {
    const detailRoutes = [
      "app/(dashboard)/dashboard/campuses/[campusId]",
      "app/(dashboard)/dashboard/classes/[classGroupId]",
      "app/(dashboard)/dashboard/courses/[courseProductId]",
      "app/(dashboard)/dashboard/students/[studentId]",
      "app/(dashboard)/dashboard/teachers/[teacherId]",
      "app/(mobile)/student/check-in/[token]",
      "app/(mobile)/student/resources/[resourceId]",
    ];

    for (const route of detailRoutes) {
      const loadingPath = join(rootDir, route, "loading.tsx");
      const errorPath = join(rootDir, route, "error.tsx");

      expect(existsSync(loadingPath), `${route} loading`).toBe(true);
      expect(existsSync(errorPath), `${route} error`).toBe(true);
      expect(readFileSync(loadingPath, "utf8")).toContain("LoadingState");
      expect(readFileSync(errorPath, "utf8")).toContain("ErrorState");
    }
  });

  it("keeps key form and workflow error messages specific", () => {
    const studentsPage = readProjectFile("app/(dashboard)/dashboard/students/page.tsx");
    const coursesPage = readProjectFile("app/(dashboard)/dashboard/courses/page.tsx");
    const schedulingPage = readProjectFile("app/(dashboard)/dashboard/scheduling/page.tsx");
    const loginPage = readProjectFile("app/(auth)/login/page.tsx");

    expect(studentsPage).toContain("提交内容不完整，请检查后重试。");
    expect(coursesPage).toContain("课程信息不完整，请检查后重试。");
    expect(schedulingPage).toContain("排课信息不完整，请检查班级、老师、教室和时间。");
    expect(schedulingPage).toContain("排课存在时间冲突");
    expect(loginPage).toContain("账号或密码错误。");
  });
});
