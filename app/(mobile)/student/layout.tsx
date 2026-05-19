import type { ReactNode } from "react";

import { MobileShell } from "@/components/layout/mobile-shell";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await requirePermission("route:student", {
    nextPath: "/student",
    unauthorizedRedirectTo: "/unauthorized",
  });

  return (
    <MobileShell role="student" title="学生端" summary="今日学习">
      {children}
    </MobileShell>
  );
}
