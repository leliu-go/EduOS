import * as React from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";

type DashboardShellProps = {
  children: React.ReactNode;
};

function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar />
          <main className="flex-1 px-4 py-6 md:px-7 md:py-7">{children}</main>
        </div>
      </div>
    </div>
  );
}

export { DashboardShell };
