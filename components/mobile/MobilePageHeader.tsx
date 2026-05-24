import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { MobileRole } from "./BottomNav";

const roleLabels: Record<MobileRole, string> = {
  student: "学生端",
  teacher: "老师端",
  parent: "家长端",
};

type MobilePageHeaderProps = {
  role: MobileRole;
  title: string;
  summary: string;
};

function MobilePageHeader({ role, title, summary }: MobilePageHeaderProps) {
  const todayLabel = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());

  return (
    <header className="border-b bg-card px-4 py-5 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary">
            {roleLabels[role]} · {todayLabel}
          </p>
          <h1 className="mt-1 truncate text-xl font-semibold tracking-normal sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
        </div>
        <Button asChild variant="ghost" size="icon" className="bg-background">
          <Link href={`/${role}/notifications`} aria-label="通知">
            <Bell className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

export { MobilePageHeader };
