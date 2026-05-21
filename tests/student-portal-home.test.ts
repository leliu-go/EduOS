import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("student portal home", () => {
  it("renders mobile-first cards for the required student home areas", () => {
    const pagePath = join(process.cwd(), "app/(mobile)/student/page.tsx");
    const source = readFileSync(pagePath, "utf8");

    expect(source).toContain('requirePermission("route:student"');
    expect(source).toContain("getStudentTimetable");
    expect(source).toContain("getStudentHomeworkReminders");
    expect(source).toContain("getStudentCheckInSchedules");
    expect(source).toContain("getStudentErrorRecords");
    expect(source).toContain("getStudentVisibleResources");
    expect(source).toContain("StudentCheckInCard");
    expect(source).toContain("TimetableCard");
    expect(source).toContain("/student/homework");
    expect(source).toContain("/student/mistakes");
    expect(source).toContain("/student/resources");
    expect(source).toContain("grid-cols-2");
    expect(source).toContain("今日课程");
    expect(source).toContain("待完成作业");
    expect(source).toContain("签到");
    expect(source).toContain("错题本");
    expect(source).toContain("学习资源");
    expect(source).toContain("今日学习任务");
  });

  it("keeps student home loading and error states", () => {
    for (const routeFile of [
      "app/(mobile)/student/loading.tsx",
      "app/(mobile)/student/error.tsx",
    ]) {
      expect(existsSync(join(process.cwd(), routeFile))).toBe(true);
    }
  });
});
