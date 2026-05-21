"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Home,
  NotebookPen,
  UserCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type MobileRole = "student" | "teacher" | "parent";

type MobileNavItem = {
  label: string;
  href: string;
  icon: typeof Home;
};

const mobileNavItems: Record<MobileRole, MobileNavItem[]> = {
  student: [
    { label: "首页", href: "/student", icon: Home },
    { label: "课表", href: "/student/schedule", icon: CalendarDays },
    { label: "作业", href: "/student/homework", icon: NotebookPen },
    { label: "错题", href: "/student/mistakes", icon: BookOpen },
    { label: "我的", href: "/student/me", icon: UserCircle },
  ],
  teacher: [
    { label: "首页", href: "/teacher", icon: Home },
    { label: "课表", href: "/teacher/schedule", icon: CalendarDays },
    { label: "班级", href: "/teacher/classes", icon: BookOpen },
    { label: "作业", href: "/teacher/homework", icon: NotebookPen },
    { label: "我的", href: "/teacher/me", icon: UserCircle },
  ],
  parent: [
    { label: "首页", href: "/parent", icon: Home },
    { label: "课表", href: "/parent/schedule", icon: CalendarDays },
    { label: "课消", href: "/parent/consumption", icon: ClipboardCheck },
    { label: "报告", href: "/parent/reports", icon: BookOpen },
    { label: "我的", href: "/parent/me", icon: UserCircle },
  ],
};

const mobileRoleLabel: Record<MobileRole, string> = {
  student: "学生端",
  teacher: "老师端",
  parent: "家长端",
};

function isActivePath(pathname: string, href: string, role: MobileRole) {
  const roleHomePath = `/${role}`;

  if (href === roleHomePath) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type MobileBottomNavProps = {
  role: MobileRole;
};

function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname() ?? `/${role}`;

  return (
    <nav
      aria-label={`${mobileRoleLabel[role]}导航`}
      className="fixed right-0 bottom-0 left-0 z-30 border-t bg-card/95 shadow-[0_-12px_28px_rgba(15,23,42,0.06)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-5 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {mobileNavItems[role].map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href, role);

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium text-muted-foreground transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary/10 text-primary",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { MobileBottomNav };
