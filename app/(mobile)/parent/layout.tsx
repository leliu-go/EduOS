import type { ReactNode } from "react";

import { MobileShell } from "@/components/layout/mobile-shell";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <MobileShell role="parent" title="家长端" summary="孩子动态">
      {children}
    </MobileShell>
  );
}
