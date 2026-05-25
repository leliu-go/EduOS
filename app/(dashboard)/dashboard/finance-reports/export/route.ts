import { buildFinanceReportCsv, getFinanceReportSummary } from "@/features/finance-reports/report";
import { createCsvDownloadResponse } from "@/lib/http/csv-response";
import { requirePermission } from "@/lib/rbac/require-permission";

export async function GET() {
  const currentUser = await requirePermission("finance:reports:view", {
    nextPath: "/dashboard/finance-reports",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const summary = await getFinanceReportSummary(currentUser.tenantId);
  const csv = buildFinanceReportCsv(summary);

  return createCsvDownloadResponse(csv, "finance-report.csv");
}
