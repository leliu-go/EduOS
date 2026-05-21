import Link from "next/link";
import * as React from "react";
import { Bell } from "lucide-react";

import { MobileBottomNav, type MobileRole } from "@/components/layout/mobile-bottom-nav";
import { Button } from "@/components/ui/button";

type MobileShellProps = {
  role: MobileRole;
  title: string;
  summary: string;
  children: React.ReactNode;
};

function MobileShell({ role, title, summary, children }: MobileShellProps) {
  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <header className="border-b bg-card px-4 py-5">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] text-primary">{summary}</p>
            <h1 className="mt-1 text-xl font-semibold tracking-normal">{title}</h1>
          </div>
          <Button asChild variant="ghost" size="icon" className="bg-background">
            <Link href={`/${role}/notifications`} aria-label="通知">
              <Bell className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-5">{children}</main>
      <MobileBottomNav role={role} />
    </div>
  );
}

export { MobileShell };
