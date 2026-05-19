import * as React from "react";

import { MobileBottomNav, type MobileRole } from "@/components/layout/mobile-bottom-nav";

type MobileShellProps = {
  role: MobileRole;
  title: string;
  summary: string;
  children: React.ReactNode;
};

function MobileShell({ role, title, summary, children }: MobileShellProps) {
  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      <header className="border-b bg-card px-4 py-5">
        <div className="mx-auto max-w-md">
          <p className="text-xs font-medium text-muted-foreground">{summary}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-normal">{title}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-5">{children}</main>
      <MobileBottomNav role={role} />
    </div>
  );
}

export { MobileShell };
