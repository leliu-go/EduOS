import * as React from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { getAppVersion } from "@/lib/version/app-version";

type DashboardShellProps = {
  children: React.ReactNode;
};

function DashboardShell({ children }: DashboardShellProps) {
  const version = getAppVersion().version;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <AppSidebar version={version} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar />
          <main className="flex-1 px-4 py-6 md:px-7 md:py-7">{children}</main>
        </div>
      </div>
    </div>
  );
}

export { DashboardShell };
