import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Home,
  Library,
  NotebookPen,
  UserCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type MobileRole = "student" | "teacher" | "parent";

type MobileNavItem = {
  label: string;
  href: string;
  icon: typeof Home;
  active?: boolean;
};

const mobileNavItems: Record<MobileRole, MobileNavItem[]> = {
  student: [
    { label: "首页", href: "/student", icon: Home, active: true },
    { label: "课表", href: "/student/schedule", icon: CalendarDays },
    { label: "作业", href: "/student/homework", icon: NotebookPen },
    { label: "错题", href: "/student/mistakes", icon: BookOpen },
    { label: "资源", href: "/student/resources", icon: Library },
  ],
  teacher: [
    { label: "首页", href: "/teacher", icon: Home, active: true },
    { label: "课表", href: "/teacher/schedule", icon: CalendarDays },
    { label: "班级", href: "/teacher/classes", icon: BookOpen },
    { label: "作业", href: "/teacher/homework", icon: NotebookPen },
    { label: "资源", href: "/teacher/resources", icon: Library },
  ],
  parent: [
    { label: "首页", href: "/parent", icon: Home, active: true },
    { label: "课表", href: "/parent/schedule", icon: CalendarDays },
    { label: "课消", href: "/parent/consumption", icon: ClipboardCheck },
    { label: "报告", href: "/parent/reports", icon: BookOpen },
    { label: "我的", href: "/parent/me", icon: UserCircle },
  ],
};

const mobileRoleLabel: Record<MobileRole, string> = {
  student: "学生端",
  teacher: "教师端",
  parent: "家长端",
};

type MobileBottomNavProps = {
  role: MobileRole;
};

function MobileBottomNav({ role }: MobileBottomNavProps) {
  return (
    <nav
      aria-label={`${mobileRoleLabel[role]}导航`}
      className="fixed right-0 bottom-0 left-0 z-30 border-t bg-card/95 shadow-[0_-12px_28px_rgba(15,23,42,0.06)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 px-2 py-2">
        {mobileNavItems[role].map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.label}>
              <a
                href={item.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium text-muted-foreground transition-colors",
                  item.active && "bg-primary/10 text-primary",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { MobileBottomNav };
