import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("teacher class dashboard", () => {
  it("builds a local-day range for today's lessons", async () => {
    const modulePath = "../features/reports/teacher-class-dashboard";
    const dashboardModule = (await import(/* @vite-ignore */ modulePath).catch(() => null)) as {
      getTeacherDashboardDateRange?: (today: Date) => { startAt: Date; endAt: Date };
    } | null;

    expect(dashboardModule?.getTeacherDashboardDateRange).toBeTypeOf("function");
    if (!dashboardModule?.getTeacherDashboardDateRange) {
      return;
    }

    const today = new Date("2026-05-20T10:30:00.000Z");
    const range = dashboardModule.getTeacherDashboardDateRange(today);

    expect(range.startAt.getHours()).toBe(0);
    expect(range.startAt.getMinutes()).toBe(0);
    expect(range.startAt.getSeconds()).toBe(0);
    expect(range.startAt.getMilliseconds()).toBe(0);
    expect(range.endAt.getHours()).toBe(23);
    expect(range.endAt.getMinutes()).toBe(59);
    expect(range.endAt.getSeconds()).toBe(59);
    expect(range.endAt.getMilliseconds()).toBe(999);
    expect(range.startAt.getTime()).toBeLessThanOrEqual(today.getTime());
    expect(range.endAt.getTime()).toBeGreaterThanOrEqual(today.getTime());
  });

  it("queries teacher dashboard data with teacher and tenant scope", () => {
    const queryPath = join(process.cwd(), "features/reports/teacher-class-dashboard.ts");

    expect(existsSync(queryPath)).toBe(true);
    if (!existsSync(queryPath)) {
      return;
    }

    const source = readFileSync(queryPath, "utf8");

    expect(source).toContain("getTeacherClassDashboard");
    expect(source).toContain("prisma.schedule.findMany");
    expect(source).toContain("getTeacherDashboardDateRange");
    expect(source).toContain("tenantId");
    expect(source).toContain("teacherUserId");
    expect(source).toContain("teacher");
    expect(source).toContain("userId: teacherUserId");
    expect(source).toContain("startAt");
    expect(source).toContain("gte: range.startAt");
    expect(source).toContain("lte: range.endAt");
    expect(source).toContain("getTeacherAttendanceSchedules");
    expect(source).toContain("getTeacherHomeworkSubmissionsForCorrection");
    expect(source).toContain("getTeacherClassWeaknessStats");
  });

  it("renders teacher dashboard sections and route states", () => {
    const pagePath = join(process.cwd(), "app/(mobile)/teacher/page.tsx");

    expect(existsSync(pagePath)).toBe(true);
    if (!existsSync(pagePath)) {
      return;
    }

    const pageSource = readFileSync(pagePath, "utf8");

    expect(pageSource).toContain("getTeacherClassDashboard");
    expect(pageSource).toContain("dashboard.todayLessons");
    expect(pageSource).toContain("dashboard.pendingAttendance");
    expect(pageSource).toContain("dashboard.pendingCorrections");
    expect(pageSource).toContain("dashboard.classWeakness");
    expect(pageSource).toContain("TimetableCard");
    expect(pageSource).toContain("AttendanceRosterForm");
    expect(pageSource).toContain("KnowledgePointWeaknessStats");
    expect(pageSource).toContain("/teacher/homework");

    for (const copy of ["今日课次", "待点名", "待批改", "班级薄弱点"]) {
      expect(pageSource).toContain(copy);
    }

    for (const routeFile of [
      "app/(mobile)/teacher/loading.tsx",
      "app/(mobile)/teacher/error.tsx",
    ]) {
      expect(existsSync(join(process.cwd(), routeFile))).toBe(true);
    }
  });
});
