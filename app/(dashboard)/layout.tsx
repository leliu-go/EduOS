import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireCurrentUser } from "@/lib/auth/current-user";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireCurrentUser();

  return <DashboardShell>{children}</DashboardShell>;
}
