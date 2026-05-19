import type { ReactNode } from "react";

import { MobileShell } from "@/components/layout/mobile-shell";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <MobileShell role="student" title="学生端" summary="今日学习">
      {children}
    </MobileShell>
  );
}
