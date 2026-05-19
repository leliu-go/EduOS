import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requirePermission("route:dashboard", {
    nextPath: "/dashboard",
    unauthorizedRedirectTo: "/unauthorized",
  });

  return <DashboardShell>{children}</DashboardShell>;
}
