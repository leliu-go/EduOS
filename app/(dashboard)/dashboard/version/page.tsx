import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/rbac/require-permission";

export default async function DashboardVersionPage() {
  await requirePermission("route:admin", {
    nextPath: "/dashboard/version",
    unauthorizedRedirectTo: "/unauthorized",
  });

  redirect("/dashboard/settings/version");
}
