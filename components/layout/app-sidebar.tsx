import {
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Home,
  Landmark,
  Library,
  NotebookPen,
  Repeat2,
  School,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";

import { getAppVersion } from "@/lib/version/app-version";
import { cn } from "@/lib/utils";

type SidebarIcon = typeof Home;

type SidebarItem = {
  label: string;
  href: string;
  icon: SidebarIcon;
  active?: boolean;
};

type SidebarGroup = {
  label: string;
  items: SidebarItem[];
};

const sidebarGroups: SidebarGroup[] = [
  {
    label: "首页",
    items: [{ label: "工作台", href: "/dashboard", icon: Home, active: true }],
  },
  {
    label: "招生",
    items: [
      { label: "招生 CRM", href: "/dashboard/enrollments", icon: Users },
      { label: "续费预警", href: "/dashboard/renewals", icon: Repeat2 },
    ],
  },
  {
    label: "教务",
    items: [
      { label: "学生", href: "/dashboard/students", icon: GraduationCap },
      { label: "老师", href: "/dashboard/teachers", icon: School },
      { label: "校区教室", href: "/dashboard/campuses", icon: Building2 },
      { label: "课程产品", href: "/dashboard/courses", icon: BookOpen },
      { label: "班级", href: "/dashboard/classes", icon: Library },
      { label: "排课", href: "/dashboard/scheduling", icon: CalendarDays },
      { label: "考勤课消", href: "/dashboard/course-accounts", icon: ClipboardCheck },
    ],
  },
  {
    label: "教学",
    items: [
      { label: "学习任务", href: "/dashboard/learning", icon: Sparkles },
      { label: "课程资源", href: "/dashboard/resources", icon: Library },
      { label: "作业", href: "/dashboard/homework", icon: NotebookPen },
    ],
  },
  {
    label: "财务",
    items: [
      { label: "支付流水", href: "/dashboard/payments", icon: WalletCards },
      { label: "课消流水", href: "/dashboard/course-consumptions", icon: ScrollText },
      { label: "财务报表", href: "/dashboard/finance-reports", icon: Landmark },
    ],
  },
  {
    label: "设置",
    items: [
      { label: "账号", href: "/dashboard/accounts", icon: Users },
      { label: "基础配置", href: "/dashboard/academic-config", icon: Settings },
      { label: "系统设置", href: "/dashboard/settings", icon: ShieldCheck },
      { label: "版本与更新", href: "/dashboard/settings/version", icon: Sparkles },
    ],
  },
];

function AppSidebar() {
  const version = getAppVersion();

  return (
    <aside
      data-eduos-sidebar
      className="border-r bg-card/95 shadow-[1px_0_0_rgba(15,23,42,0.02)]"
    >
      <div
        data-eduos-sidebar-header
        className="flex h-20 items-center justify-center border-b px-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-5" aria-hidden="true" />
          </div>
          <div data-eduos-sidebar-brand>
            <p className="text-base font-semibold tracking-normal text-foreground">EduOS</p>
            <p className="text-xs text-muted-foreground">教培运营系统</p>
          </div>
        </div>
      </div>
      <nav
        data-eduos-sidebar-nav
        aria-label="主导航"
        className="flex-1 overflow-y-auto px-2 py-4"
      >
        <div className="space-y-5">
          {sidebarGroups.map((group) => (
            <section key={group.label} aria-label={group.label} className="space-y-1">
              <p
                data-eduos-sidebar-group-label
                className="px-3 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground"
              >
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <li key={`${group.label}-${item.label}`}>
                      <a
                        href={item.href}
                        aria-label={item.label}
                        data-eduos-sidebar-link
                        className={cn(
                          "flex items-center rounded-md py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                          item.active &&
                            "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground",
                        )}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        <span data-eduos-sidebar-text>{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </nav>
      <div data-eduos-sidebar-footer className="border-t px-2 py-4 text-xs text-muted-foreground">
        <a
          href="/dashboard/settings/version"
          data-eduos-sidebar-version
          className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label={`当前版本 v${version.version}`}
        >
          <span data-eduos-sidebar-version-short className="font-medium text-foreground">
            v{version.version}
          </span>
          <span data-eduos-sidebar-version-label>当前版本</span>
          <span data-eduos-sidebar-version-full className="font-medium text-foreground">
            v{version.version}
          </span>
        </a>
      </div>
    </aside>
  );
}

export { AppSidebar };
