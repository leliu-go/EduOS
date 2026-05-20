import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("renewal warning", () => {
  it("builds renewal triggers from balance, attendance, homework, and progress signals", async () => {
    const modulePath = "../features/renewals/renewal-warning";
    const renewalModule = (await import(/* @vite-ignore */ modulePath).catch(() => null)) as {
      calculateRenewalRate?: (part: number, total: number) => number;
      buildRenewalTriggers?: (input: {
        remainingHours: number;
        totalHours: number;
        attendanceRate: number;
        attendanceTotal: number;
        homeworkCompletionRate: number;
        homeworkTotal: number;
      }) => string[];
    } | null;

    expect(renewalModule?.calculateRenewalRate).toBeTypeOf("function");
    expect(renewalModule?.buildRenewalTriggers).toBeTypeOf("function");
    if (!renewalModule?.calculateRenewalRate || !renewalModule.buildRenewalTriggers) {
      return;
    }

    expect(renewalModule.calculateRenewalRate(9, 10)).toBe(90);
    expect(renewalModule.calculateRenewalRate(0, 0)).toBe(0);
    expect(
      renewalModule.buildRenewalTriggers({
        remainingHours: 3,
        totalHours: 40,
        attendanceRate: 95,
        attendanceTotal: 8,
        homeworkCompletionRate: 92,
        homeworkTotal: 8,
      }),
    ).toEqual(["LOW_BALANCE", "NEAR_COURSE_END", "STRONG_PROGRESS"]);
    expect(
      renewalModule.buildRenewalTriggers({
        remainingHours: 18,
        totalHours: 40,
        attendanceRate: 62,
        attendanceTotal: 8,
        homeworkCompletionRate: 50,
        homeworkTotal: 8,
      }),
    ).toEqual(["LOW_ATTENDANCE"]);
  });

  it("queries renewal follow-up list with tenant and optional campus scope", () => {
    const queryPath = join(process.cwd(), "features/renewals/renewal-warning.ts");

    expect(existsSync(queryPath)).toBe(true);
    if (!existsSync(queryPath)) {
      return;
    }

    const source = readFileSync(queryPath, "utf8");

    expect(source).toContain("getRenewalFollowUpList");
    expect(source).toContain("tenantId");
    expect(source).toContain("campusId");
    expect(source).toContain("courseAccount.findMany");
    expect(source).toContain("calculateCourseAccountBalance");
    expect(source).toContain("attendance.findMany");
    expect(source).toContain("homeworkSubmission.findMany");
    expect(source).toContain("LOW_BALANCE");
    expect(source).toContain("NEAR_COURSE_END");
    expect(source).toContain("LOW_ATTENDANCE");
    expect(source).toContain("STRONG_PROGRESS");
  });

  it("renders staff renewal warning page and navigation", () => {
    const pagePath = join(process.cwd(), "app/(dashboard)/dashboard/renewals/page.tsx");
    const sidebarPath = join(process.cwd(), "components/layout/app-sidebar.tsx");
    const e2ePath = join(process.cwd(), "tests/e2e/auth.spec.ts");

    expect(existsSync(pagePath)).toBe(true);
    expect(existsSync(sidebarPath)).toBe(true);
    if (!existsSync(pagePath) || !existsSync(sidebarPath)) {
      return;
    }

    const pageSource = readFileSync(pagePath, "utf8");
    const querySource = readFileSync(
      join(process.cwd(), "features/renewals/renewal-warning.ts"),
      "utf8",
    );
    const sidebarSource = readFileSync(sidebarPath, "utf8");
    const e2eSource = readFileSync(e2ePath, "utf8");

    expect(pageSource).toContain('requirePermission("reports:institution:view"');
    expect(pageSource).toContain("getRenewalFollowUpList");
    expect(pageSource).toContain("currentUser.campusId");
    expect(sidebarSource).toContain("/dashboard/renewals");
    expect(e2eSource).toContain("/dashboard/renewals");

    expect(pageSource).toContain("renewalTriggerLabels");
    for (const copy of ["续费预警", "低课时", "临近结课", "到课偏低", "成长良好"]) {
      expect(pageSource + querySource).toContain(copy);
    }

    for (const routeFile of [
      "app/(dashboard)/dashboard/renewals/loading.tsx",
      "app/(dashboard)/dashboard/renewals/error.tsx",
    ]) {
      expect(existsSync(join(process.cwd(), routeFile))).toBe(true);
    }
  });
});
