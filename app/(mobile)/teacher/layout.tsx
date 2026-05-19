import type { ReactNode } from "react";

import { MobileShell } from "@/components/layout/mobile-shell";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <MobileShell role="teacher" title="教师端" summary="今日授课">
      {children}
    </MobileShell>
  );
}
