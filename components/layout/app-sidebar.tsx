import {
  BarChart3,
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
  Users,
  WalletCards,
} from "lucide-react";

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
    items: [{ label: "机构首页", href: "/dashboard", icon: Home, active: true }],
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
      { label: "课程", href: "/dashboard/courses", icon: BookOpen },
      { label: "班级", href: "/dashboard/classes", icon: Library },
      { label: "排课", href: "/dashboard/scheduling", icon: CalendarDays },
      { label: "考勤课消", href: "/dashboard/course-accounts", icon: ClipboardCheck },
    ],
  },
  {
    label: "教学",
    items: [
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
    label: "数据",
    items: [{ label: "数据看板", href: "/dashboard", icon: BarChart3 }],
  },
  {
    label: "设置",
    items: [
      { label: "账号", href: "/dashboard/accounts", icon: Users },
      { label: "基础配置", href: "/dashboard/academic-config", icon: Settings },
    ],
  },
];

function AppSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r bg-card lg:block">
      <div className="flex h-16 items-center border-b px-5">
        <div>
          <p className="text-sm font-semibold text-foreground">EduOS</p>
          <p className="text-xs text-muted-foreground">教学运营系统</p>
        </div>
      </div>
      <nav aria-label="主导航" className="px-3 py-4">
        <div className="space-y-5">
          {sidebarGroups.map((group) => (
            <section key={group.label} aria-label={group.label} className="space-y-1">
              <p className="px-3 text-xs font-semibold tracking-normal text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                          item.active && "bg-primary/10 text-primary",
                        )}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        <span>{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </nav>
    </aside>
  );
}

export { AppSidebar };
