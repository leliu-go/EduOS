import type { ReactNode } from "react";

import { MobileShell } from "@/components/layout/mobile-shell";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  await requirePermission("route:teacher", {
    nextPath: "/teacher",
    unauthorizedRedirectTo: "/unauthorized",
  });

  return (
    <MobileShell role="teacher" title="教师端" summary="今日授课">
      {children}
    </MobileShell>
  );
}
