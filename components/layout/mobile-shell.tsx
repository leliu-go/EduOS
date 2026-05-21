import * as React from "react";

import { MobilePageHeader } from "@/components/mobile/MobilePageHeader";
import { MobileBottomNav, type MobileRole } from "@/components/layout/mobile-bottom-nav";

type MobileShellProps = {
  role: MobileRole;
  title: string;
  summary: string;
  children: React.ReactNode;
};

function MobileShell({ role, title, summary, children }: MobileShellProps) {
  return (
    <div className="min-h-screen bg-background pb-[calc(6rem+env(safe-area-inset-bottom))] text-foreground">
      <MobilePageHeader role={role} title={title} summary={summary} />
      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      <MobileBottomNav role={role} />
    </div>
  );
}

export { MobileShell };
