import { NextResponse } from "next/server";

import { buildAccountCsv } from "@/features/accounts/account-csv";
import { getAccountDirectory } from "@/features/accounts/queries";
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

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="eduos-accounts.csv"',
      "Cache-Control": "no-store",
    },
  });
}
