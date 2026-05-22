import { NextResponse } from "next/server";

import { buildAccountImportTemplate } from "@/features/accounts/account-csv";
import { requirePermission } from "@/lib/rbac/require-permission";

export async function GET() {
  await requirePermission("accounts:import", {
    nextPath: "/dashboard/accounts",
    unauthorizedRedirectTo: "/unauthorized",
  });

  return new NextResponse(`\uFEFF${buildAccountImportTemplate()}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="eduos-account-import-template.csv"',
      "Cache-Control": "no-store",
    },
  });
}
