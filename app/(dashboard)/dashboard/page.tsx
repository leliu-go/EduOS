import {
  AlertTriangle,
  ClipboardCheck,
  GraduationCap,
  NotebookPen,
  Percent,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getPrincipalDashboard } from "@/features/dashboard/principal-dashboard";
import { requirePermission } from "@/lib/rbac/require-permission";

const metricIconClass = {
  blue: "bg-primary/10 text-primary",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-slate-100 text-slate-700",
  sky: "bg-sky-50 text-sky-700",
} as const;

export default async function DashboardPage() {
  const currentUser = await requirePermission("route:dashboard", {
    nextPath: "/dashboard",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const dashboard = await getPrincipalDashboard(currentUser.tenantId, {
    campusId: currentUser.campusId,
  });
  const hasActivity =
    dashboard.activeStudents > 0 ||
    dashboard.newEnrollments > 0 ||
    dashboard.attendanceTotal > 0 ||
    dashboard.courseConsumptionHours > 0 ||
    dashboard.remainingLiabilityHours > 0 ||
    dashboard.pendingHomework > 0 ||
    dashboard.lowBalanceWarnings > 0;
  const metrics = [
    {
      label: "活跃学生",
      value: dashboard.activeStudents.toString(),
      helper: "当前在读学生",
      tone: "blue",
      icon: GraduationCap,
    },
    {
      label: "新增报名",
      value: dashboard.newEnrollments.toString(),
      helper: "本月新增报名",
      tone: "green",
      icon: ClipboardCheck,
    },
    {
      label: "到课率",
      value: `${dashboard.attendanceRate}%`,
      helper: `${dashboard.attendanceAttended}/${dashboard.attendanceTotal} 人次`,
      tone: "sky",
      icon: Percent,
    },
    {
      label: "课消",
      value: dashboard.courseConsumptionHours.toString(),
      helper: "本月已消课时",
      tone: "slate",
      icon: ReceiptText,
    },
    {
      label: "剩余负债",
      value: dashboard.remainingLiabilityHours.toString(),
      helper: "未交付课时",
      tone: "amber",
      icon: WalletCards,
    },
    {
      label: "待批改作业",
      value: dashboard.pendingHomework.toString(),
      helper: "等待老师批改",
      tone: "amber",
      icon: NotebookPen,
    },
    {
      label: "低课时预警",
      value: dashboard.lowBalanceWarnings.toString(),
      helper: "剩余不高于 4 课时",
      tone: "red",
      icon: AlertTriangle,
    },
  ] as const;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">机构看板</h1>
          <p className="mt-2 text-sm text-muted-foreground">本月招生、出勤、课消与作业处理概览。</p>
        </div>
        <Badge variant="secondary">{dashboard.scope.campusId ? "校区范围" : "机构范围"}</Badge>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label} className="shadow-none">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="mt-2 text-3xl tracking-normal">{metric.value}</CardTitle>
                </div>
                <div className={`rounded-md p-2 ${metricIconClass[metric.tone]}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{metric.helper}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {!hasActivity ? (
        <EmptyState
          title="暂无运营数据"
          description="产生学生、报名、点名或课消记录后，看板会自动更新。"
        />
      ) : null}

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>经营健康度</CardTitle>
            <CardDescription>从课消、负债和低课时预警快速判断本月运营压力。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3 rounded-md border p-3">
              <span className="text-muted-foreground">剩余负债课时</span>
              <span className="font-semibold text-foreground">
                {dashboard.remainingLiabilityHours}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border p-3">
              <span className="text-muted-foreground">低课时学生</span>
              <span className="font-semibold text-foreground">{dashboard.lowBalanceWarnings}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>教学待办</CardTitle>
            <CardDescription>聚焦点名质量和待批改作业，避免教学服务积压。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3 rounded-md border p-3">
              <span className="text-muted-foreground">本月到课率</span>
              <span className="font-semibold text-foreground">{dashboard.attendanceRate}%</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border p-3">
              <span className="text-muted-foreground">待批改作业</span>
              <span className="font-semibold text-foreground">{dashboard.pendingHomework}</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
