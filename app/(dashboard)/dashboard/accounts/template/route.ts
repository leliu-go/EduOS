import { buildAccountImportTemplate } from "@/features/accounts/account-csv";
import { createCsvDownloadResponse } from "@/lib/http/csv-response";
import { requirePermission } from "@/lib/rbac/require-permission";

export async function GET() {
  await requirePermission("accounts:import", {
    nextPath: "/dashboard/accounts",
    unauthorizedRedirectTo: "/unauthorized",
  });

  return createCsvDownloadResponse(
    `\uFEFF${buildAccountImportTemplate()}`,
    "eduos-account-import-template.csv",
  );
}
