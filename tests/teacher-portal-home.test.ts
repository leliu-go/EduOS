import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("teacher portal home", () => {
  it("queries teacher-scoped attention students for the mobile home", () => {
    const source = readFileSync(
      join(process.cwd(), "features/reports/teacher-class-dashboard.ts"),
      "utf8",
    );

    expect(source).toContain("getTeacherAttentionStudents");
    expect(source).toContain("teacherDashboardAttentionStudentTake");
    expect(source).toContain("getTeacherErrorRecordScope");
    expect(source).toContain("studentId");
    expect(source).toContain("studentProfile.findMany");
    expect(source).toContain("tenantId");
  });

  it("renders quick-action cards for the required teacher home areas", () => {
    const page = readFileSync(join(process.cwd(), "app/(mobile)/teacher/page.tsx"), "utf8");

    expect(page).toContain('requirePermission("route:teacher"');
    expect(page).toContain("getTeacherClassDashboard");
    expect(page).toContain("dashboard.todayLessons");
    expect(page).toContain("dashboard.pendingAttendance");
    expect(page).toContain("dashboard.pendingCorrections");
    expect(page).toContain("dashboard.attentionStudents");
    expect(page).toContain("AttendanceRosterForm");
    expect(page).toContain("TimetableCard");
    expect(page).toContain("KnowledgePointWeaknessStats");
    expect(page).toContain("grid-cols-2");
    expect(page).toContain("今日课程");
    expect(page).toContain("待点名");
    expect(page).toContain("待批改");
    expect(page).toContain("需关注学生");
    expect(page).toContain('id="today-lessons"');
    expect(page).toContain('id="pending-attendance"');
    expect(page).toContain("/teacher/homework");
    expect(page).toContain("/teacher/classes");
  });

  it("keeps teacher home loading and error states", () => {
    for (const routeFile of [
      "app/(mobile)/teacher/loading.tsx",
      "app/(mobile)/teacher/error.tsx",
    ]) {
      expect(existsSync(join(process.cwd(), routeFile))).toBe(true);
    }
  });
});
