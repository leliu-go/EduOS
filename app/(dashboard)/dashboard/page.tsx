import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  NotebookPen,
  ReceiptText,
  RefreshCcw,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getPrincipalDashboard } from "@/features/dashboard/principal-dashboard";
import { requirePermission } from "@/lib/rbac/require-permission";

const todoIconClass = {
  primary: "bg-primary/10 text-primary",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  green: "bg-emerald-50 text-emerald-700",
  slate: "bg-slate-100 text-slate-700",
} as const;

export default async function DashboardPage() {
  const currentUser = await requirePermission("route:dashboard", {
    nextPath: "/dashboard",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const dashboard = await getPrincipalDashboard(currentUser.tenantId, {
    campusId: currentUser.campusId,
  });
  const hasWorkbenchData =
    dashboard.todaySchedules > 0 ||
    dashboard.todayPendingAttendance > 0 ||
    dashboard.todayPendingCourseConsumption > 0 ||
    dashboard.pendingHomework > 0 ||
    dashboard.lowBalanceWarnings > 0 ||
    dashboard.pendingPayments > 0 ||
    dashboard.pendingRefunds > 0;
  const todoItems = [
    {
      label: "今日课程",
      value: dashboard.todaySchedules,
      helper: "今日未取消排课",
      href: "/dashboard/scheduling",
      tone: "primary",
      icon: CalendarDays,
    },
    {
      label: "今日待点名",
      value: dashboard.todayPendingAttendance,
      helper: "按今日排课减已生成考勤记录估算",
      href: "/dashboard/scheduling",
      tone: dashboard.todayPendingAttendance > 0 ? "amber" : "green",
      icon: ClipboardCheck,
    },
    {
      label: "今日待课消",
      value: dashboard.todayPendingCourseConsumption,
      helper: "按今日排课减已生成课消记录估算",
      href: "/dashboard/course-consumptions",
      tone: dashboard.todayPendingCourseConsumption > 0 ? "amber" : "green",
      icon: ReceiptText,
    },
    {
      label: "待批改作业",
      value: dashboard.pendingHomework,
      helper: "等待老师批改的提交",
      href: "/dashboard/homework",
      tone: dashboard.pendingHomework > 0 ? "amber" : "green",
      icon: NotebookPen,
    },
    {
      label: "低课时预警",
      value: dashboard.lowBalanceWarnings,
      helper: "剩余不高于 4 课时的账户",
      href: "/dashboard/renewals",
      tone: dashboard.lowBalanceWarnings > 0 ? "red" : "green",
      icon: AlertTriangle,
    },
    {
      label: "待续费学生",
      value: dashboard.renewalWarnings,
      helper: "当前沿用低课时预警作为续费线索",
      href: "/dashboard/renewals",
      tone: dashboard.renewalWarnings > 0 ? "red" : "green",
      icon: RefreshCcw,
    },
    {
      label: "待确认收款",
      value: dashboard.pendingPayments,
      helper: "待财务确认的支付流水",
      href: "/dashboard/payments",
      tone: dashboard.pendingPayments > 0 ? "amber" : "green",
      icon: WalletCards,
    },
    {
      label: "待处理退款",
      value: dashboard.pendingRefunds,
      helper: "等待审核的退款申请",
      href: "/dashboard/payments",
      tone: dashboard.pendingRefunds > 0 ? "amber" : "green",
      icon: AlertTriangle,
    },
  ] as const;
  const quickActions = [
    { label: "新增学生", href: "/dashboard/students" },
    { label: "排课", href: "/dashboard/scheduling" },
    { label: "创建作业", href: "/dashboard/homework" },
    { label: "录入收款", href: "/dashboard/payments" },
    { label: "查看预警", href: "/dashboard/renewals" },
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">工作台</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            聚焦今天要处理的教务、教学、财务和续费事项。
          </p>
        </div>
        <Badge variant="secondary">{dashboard.scope.campusId ? "校区范围" : "机构范围"}</Badge>
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>今天要处理</CardTitle>
            <CardDescription>
              工作台只显示可执行事项；经营分析后续独立建设，不再复制首页。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasWorkbenchData ? (
              <div className="grid gap-3 md:grid-cols-2">
                {todoItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex min-h-24 items-start justify-between gap-4 rounded-md border p-4 transition-colors hover:bg-accent/60"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="mt-2 text-2xl font-semibold tracking-normal">{item.value}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {item.helper}
                        </p>
                      </div>
                      <span className={`rounded-md p-2 ${todoIconClass[item.tone]}`}>
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                    </a>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="今天暂无待办"
                description="产生排课、点名、课消、作业或财务流水后，工作台会显示下一步要处理的事项。"
              />
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>快捷操作</CardTitle>
            <CardDescription>把高频入口放在工作台，减少来回找菜单。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {quickActions.map((action) => (
              <Button key={action.label} asChild variant="outline" className="justify-start">
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>今日收款摘要</CardTitle>
            <CardDescription>收款先进入流水，确认收入以后续课消为准。</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">待确认收款</span>
            <span className="text-2xl font-semibold tracking-normal">
              {dashboard.pendingPayments}
            </span>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>本月课消摘要</CardTitle>
            <CardDescription>用于观察服务交付和收入确认节奏。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">已课消课时</span>
              <span className="font-semibold text-foreground">
                {dashboard.courseConsumptionHours}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">今日已课消</span>
              <span className="font-semibold text-foreground">
                {dashboard.todayCourseConsumptionHours}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>未提交作业学生</CardTitle>
            <CardDescription>该统计需要补齐作业分配与提交差异查询。</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            当前先展示待批改作业，未提交统计已进入后续计划。
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>学生与招生</CardTitle>
            <CardDescription>本月招生和在读规模。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">活跃学生</span>
              <span className="font-semibold text-foreground">{dashboard.activeStudents}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">本月新增报名</span>
              <span className="font-semibold text-foreground">{dashboard.newEnrollments}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>教学服务</CardTitle>
            <CardDescription>关注到课率和作业处理。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">本月到课率</span>
              <span className="font-semibold text-foreground">{dashboard.attendanceRate}%</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">待批改作业</span>
              <span className="font-semibold text-foreground">{dashboard.pendingHomework}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>课时负债</CardTitle>
            <CardDescription>剩余未交付课时用于续费和服务风险判断。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">剩余负债课时</span>
              <span className="font-semibold text-foreground">
                {dashboard.remainingLiabilityHours}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">低课时账户</span>
              <span className="font-semibold text-foreground">{dashboard.lowBalanceWarnings}</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
