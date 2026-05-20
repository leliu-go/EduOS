import { buildFinanceReportCsv, getFinanceReportSummary } from "@/features/finance-reports/report";
import { requirePermission } from "@/lib/rbac/require-permission";

export async function GET() {
  const currentUser = await requirePermission("finance:reports:view", {
    nextPath: "/dashboard/finance-reports",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const summary = await getFinanceReportSummary(currentUser.tenantId);
  const csv = buildFinanceReportCsv(summary);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="finance-report.csv"',
    },
  });
}
