import type { ReactNode } from "react";

import { MobileShell } from "@/components/layout/mobile-shell";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function ParentLayout({ children }: { children: ReactNode }) {
  await requirePermission("route:parent", {
    nextPath: "/parent",
    unauthorizedRedirectTo: "/unauthorized",
  });

  return (
    <MobileShell role="parent" title="家长端" summary="孩子动态">
      {children}
    </MobileShell>
  );
}
