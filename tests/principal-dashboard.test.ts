import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("principal dashboard", () => {
  it("calculates dashboard rates and remaining liability safely", async () => {
    const modulePath = "../features/dashboard/principal-dashboard";
    const dashboardModule = (await import(/* @vite-ignore */ modulePath).catch(() => null)) as {
      calculateDashboardRate?: (part: number, total: number) => number;
      calculateRemainingLiabilityHours?: (input: {
        purchasedHours: number | null;
        giftHours: number | null;
        usedHours: number | null;
        frozenHours: number | null;
      }) => number;
      getPrincipalDashboardDateRange?: (today: Date) => { startAt: Date; endAt: Date };
    } | null;

    expect(dashboardModule?.calculateDashboardRate).toBeTypeOf("function");
    expect(dashboardModule?.calculateRemainingLiabilityHours).toBeTypeOf("function");
    expect(dashboardModule?.getPrincipalDashboardDateRange).toBeTypeOf("function");
    if (
      !dashboardModule?.calculateDashboardRate ||
      !dashboardModule.calculateRemainingLiabilityHours ||
      !dashboardModule.getPrincipalDashboardDateRange
    ) {
      return;
    }

    expect(dashboardModule.calculateDashboardRate(9, 12)).toBe(75);
    expect(dashboardModule.calculateDashboardRate(0, 0)).toBe(0);
    expect(
      dashboardModule.calculateRemainingLiabilityHours({
        purchasedHours: 20,
        giftHours: 2,
        usedHours: 7,
        frozenHours: 1,
      }),
    ).toBe(14);
    expect(
      dashboardModule.calculateRemainingLiabilityHours({
        purchasedHours: 4,
        giftHours: 0,
        usedHours: 8,
        frozenHours: 0,
      }),
    ).toBe(0);

    const range = dashboardModule.getPrincipalDashboardDateRange(
      new Date("2026-05-20T10:30:00.000Z"),
    );

    expect(range.startAt.getDate()).toBe(1);
    expect(range.startAt.getHours()).toBe(0);
    expect(range.startAt.getMinutes()).toBe(0);
    expect(range.endAt.getTime()).toBeGreaterThan(range.startAt.getTime());
  });

  it("queries organization metrics with tenant and optional campus scope", () => {
    const queryPath = join(process.cwd(), "features/dashboard/principal-dashboard.ts");

    expect(existsSync(queryPath)).toBe(true);
    if (!existsSync(queryPath)) {
      return;
    }

    const source = readFileSync(queryPath, "utf8");

    expect(source).toContain("getPrincipalDashboard");
    expect(source).toContain("tenantId");
    expect(source).toContain("campusId");
    expect(source).toContain("studentProfile.count");
    expect(source).toContain("enrollment.count");
    expect(source).toContain("attendance.count");
    expect(source).toContain("courseConsumption.aggregate");
    expect(source).toContain("courseAccount.aggregate");
    expect(source).toContain("courseAccount.findMany");
    expect(source).toContain("homeworkSubmission.count");
    expect(source).toContain("lowBalanceWarnings");
    expect(source).toContain('status: "ACTIVE"');
    expect(source).toContain('status: "PENDING_CORRECTION"');
  });

  it("renders the dashboard page with real metrics and route states", () => {
    const pagePath = join(process.cwd(), "app/(dashboard)/dashboard/page.tsx");
    const currentUserPath = join(process.cwd(), "lib/auth/current-user.ts");

    expect(existsSync(pagePath)).toBe(true);
    expect(existsSync(currentUserPath)).toBe(true);
    if (!existsSync(pagePath) || !existsSync(currentUserPath)) {
      return;
    }

    const pageSource = readFileSync(pagePath, "utf8");
    const currentUserSource = readFileSync(currentUserPath, "utf8");

    expect(pageSource).toContain('requirePermission("route:dashboard"');
    expect(pageSource).toContain("getPrincipalDashboard");
    expect(pageSource).toContain("currentUser.campusId");
    expect(currentUserSource).toContain("campusId");

    for (const copy of [
      "机构看板",
      "活跃学生",
      "新增报名",
      "到课率",
      "课消",
      "剩余负债",
      "待批改作业",
      "低课时预警",
    ]) {
      expect(pageSource).toContain(copy);
    }

    for (const routeFile of [
      "app/(dashboard)/dashboard/loading.tsx",
      "app/(dashboard)/dashboard/error.tsx",
    ]) {
      expect(existsSync(join(process.cwd(), routeFile))).toBe(true);
    }
  });
});
