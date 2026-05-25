import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type FinanceReportModule = {
  buildFinanceReportCsv: (summary: {
    payments: { confirmedAmount: number; pendingAmount: number; count: number };
    refunds: { approvedAmount: number; pendingAmount: number; count: number };
    courseConsumptionRevenue: { consumedHours: number; estimatedRevenue: number };
    remainingCourseLiability: { remainingHours: number; accountCount: number };
    receivables: { pendingOrderAmount: number; pendingOrderCount: number };
  }) => string;
};

describe("finance reports", () => {
  it("builds tenant-scoped finance report data and CSV exports", async () => {
    const reportPath = join(process.cwd(), "features/finance-reports/report.ts");

    expect(existsSync(reportPath)).toBe(true);
    if (!existsSync(reportPath)) {
      return;
    }

    const source = readFileSync(reportPath, "utf8");

    expect(source).toContain("getFinanceReportSummary");
    expect(source).toContain("buildFinanceReportCsv");
    expect(source).toContain("tenantId");
    expect(source).toContain("prisma.payment.aggregate");
    expect(source).toContain("prisma.refund.aggregate");
    expect(source).toContain("prisma.order.aggregate");
    expect(source).toContain("prisma.courseConsumption.findMany");
    expect(source).toContain("prisma.courseAccount.aggregate");

    const moduleSpecifier = "../features/finance-reports/report";
    const { buildFinanceReportCsv } = (await import(moduleSpecifier)) as FinanceReportModule;
    const csv = buildFinanceReportCsv({
      payments: { confirmedAmount: 1200, pendingAmount: 300, count: 4 },
      refunds: { approvedAmount: 200, pendingAmount: 50, count: 2 },
      courseConsumptionRevenue: { consumedHours: 8, estimatedRevenue: 640 },
      remainingCourseLiability: { remainingHours: 32, accountCount: 6 },
      receivables: { pendingOrderAmount: 900, pendingOrderCount: 3 },
    });

    expect(csv).toContain("metric,value");
    expect(csv).toContain("payments.confirmedAmount,1200");
    expect(csv).toContain("remainingCourseLiability.remainingHours,32");
    expect(csv).toContain("receivables.pendingOrderAmount,900");
  });

  it("renders a role-protected finance report page and export route", () => {
    const pagePath = join(process.cwd(), "app/(dashboard)/dashboard/finance-reports/page.tsx");
    const routePath = join(
      process.cwd(),
      "app/(dashboard)/dashboard/finance-reports/export/route.ts",
    );
    const sidebarPath = join(process.cwd(), "components/layout/app-sidebar.tsx");
    const e2ePath = join(process.cwd(), "tests/e2e/auth.spec.ts");

    for (const file of [pagePath, routePath]) {
      expect(existsSync(file)).toBe(true);
    }

    if (!existsSync(pagePath) || !existsSync(routePath)) {
      return;
    }

    const pageSource = readFileSync(pagePath, "utf8");
    const routeSource = readFileSync(routePath, "utf8");
    const sidebarSource = readFileSync(sidebarPath, "utf8");
    const e2eSource = readFileSync(e2ePath, "utf8");

    expect(pageSource).toContain('requirePermission("finance:reports:view"');
    expect(pageSource).toContain("getFinanceReportSummary");
    expect(pageSource).toContain("/dashboard/finance-reports/export");
    expect(pageSource).toContain("实收金额");
    expect(pageSource).toContain("已课消收入");
    expect(pageSource).toContain("未消课余额");
    expect(pageSource).toContain("欠费/应收");
    expect(routeSource).toContain('requirePermission("finance:reports:view"');
    expect(routeSource).toContain("buildFinanceReportCsv");
    expect(routeSource).toContain("Content-Disposition");
    expect(routeSource).toContain("text/csv");
    expect(routeSource).toContain('"Cache-Control": "no-store"');
    expect(sidebarSource).toContain("/dashboard/finance-reports");
    expect(e2eSource).toContain("/dashboard/finance-reports");

    for (const routeFile of [
      "app/(dashboard)/dashboard/finance-reports/loading.tsx",
      "app/(dashboard)/dashboard/finance-reports/error.tsx",
    ]) {
      expect(existsSync(join(process.cwd(), routeFile))).toBe(true);
    }
  });
});
