import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("student learning report", () => {
  it("calculates report rates without dividing by zero", async () => {
    const modulePath = "../features/reports/student-learning-report";
    const reportModule = (await import(/* @vite-ignore */ modulePath).catch(() => null)) as {
      calculateLearningReportRates?: (input: {
        attendanceTotal: number;
        attendanceAttended: number;
        homeworkTotal: number;
        homeworkCompleted: number;
      }) => { attendanceRate: number; homeworkCompletionRate: number };
    } | null;

    expect(reportModule?.calculateLearningReportRates).toBeTypeOf("function");
    if (!reportModule?.calculateLearningReportRates) {
      return;
    }

    expect(
      reportModule.calculateLearningReportRates({
        attendanceTotal: 4,
        attendanceAttended: 3,
        homeworkTotal: 5,
        homeworkCompleted: 2,
      }),
    ).toEqual({ attendanceRate: 75, homeworkCompletionRate: 40 });

    expect(
      reportModule.calculateLearningReportRates({
        attendanceTotal: 0,
        attendanceAttended: 0,
        homeworkTotal: 0,
        homeworkCompleted: 0,
      }),
    ).toEqual({ attendanceRate: 0, homeworkCompletionRate: 0 });
  });

  it("queries student and parent reports with own-data scope", () => {
    const queryPath = join(process.cwd(), "features/reports/student-learning-report.ts");

    expect(existsSync(queryPath)).toBe(true);
    if (!existsSync(queryPath)) {
      return;
    }

    const source = readFileSync(queryPath, "utf8");

    expect(source).toContain("getStudentLearningReport");
    expect(source).toContain("getParentLearningReports");
    expect(source).toContain("studentProfile.findFirst");
    expect(source).toContain("userId");
    expect(source).toContain("guardians");
    expect(source).toContain("parentUserId");
    expect(source).toContain("attendance.count");
    expect(source).toContain("homeworkSubmission.count");
    expect(source).toContain("errorRecord.count");
    expect(source).toContain("getStudentKnowledgePointWeaknessStatsByStudentId");
    expect(source).toContain("lessonFeedback.findMany");
  });

  it("renders student and parent report pages with route states", () => {
    const studentPagePath = join(process.cwd(), "app/(mobile)/student/reports/page.tsx");
    const parentPagePath = join(process.cwd(), "app/(mobile)/parent/reports/page.tsx");
    const cardPath = join(process.cwd(), "features/reports/student-learning-report-card.tsx");

    for (const file of [studentPagePath, parentPagePath, cardPath]) {
      expect(existsSync(file)).toBe(true);
    }

    if (!existsSync(studentPagePath) || !existsSync(parentPagePath) || !existsSync(cardPath)) {
      return;
    }

    const studentPage = readFileSync(studentPagePath, "utf8");
    const parentPage = readFileSync(parentPagePath, "utf8");
    const cardSource = readFileSync(cardPath, "utf8");

    expect(studentPage).toContain('requirePermission("route:student"');
    expect(studentPage).toContain("getStudentLearningReport");
    expect(parentPage).toContain('requirePermission("route:parent"');
    expect(parentPage).toContain("getParentLearningReports");
    for (const copy of ["学习报告", "出勤", "作业完成", "错题", "薄弱知识点", "老师评语"]) {
      expect(studentPage + parentPage + cardSource).toContain(copy);
    }

    for (const routeFile of [
      "app/(mobile)/student/reports/loading.tsx",
      "app/(mobile)/student/reports/error.tsx",
      "app/(mobile)/parent/reports/loading.tsx",
      "app/(mobile)/parent/reports/error.tsx",
    ]) {
      expect(existsSync(join(process.cwd(), routeFile))).toBe(true);
    }
  });

  it("protects report routes in e2e coverage", () => {
    const e2eSource = readFileSync(join(process.cwd(), "tests/e2e/auth.spec.ts"), "utf8");

    expect(e2eSource).toContain("/student/reports");
    expect(e2eSource).toContain("/parent/reports");
  });
});
