import { buildAccountCsv } from "@/features/accounts/account-csv";
import { getAccountDirectory } from "@/features/accounts/queries";
import { createCsvDownloadResponse } from "@/lib/http/csv-response";
import { requirePermission } from "@/lib/rbac/require-permission";

export async function GET() {
  const currentUser = await requirePermission("accounts:export", {
    nextPath: "/dashboard/accounts",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const accounts = await getAccountDirectory(currentUser.tenantId);
  const csv = buildAccountCsv(
    accounts.map((account) => ({
      role: account.memberships[0]?.role.key ?? currentUser.roleKey,
      name: account.name,
      email: account.email ?? "",
      phone: account.phone ?? "",
      status: account.status,
    })),
  );

  return createCsvDownloadResponse(csv, "eduos-accounts.csv");
}
