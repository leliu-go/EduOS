import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  dashboardDemoData,
  type DashboardScheduleItem,
} from "@/features/dashboard/mock-dashboard-data";
import { cn } from "@/lib/utils";

const metricToneClass = {
  blue: "bg-primary/10 text-primary",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-slate-100 text-slate-700",
};

const priorityVariant = {
  高: "destructive",
  中: "secondary",
  低: "outline",
} as const;

function DashboardDemo() {
  const maxLessons = Math.max(...dashboardDemoData.weeklyPlan.map((item) => item.lessons));

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">机构工作台</h1>
          <p className="mt-2 text-sm text-muted-foreground">今日运营、教学与课消概览。</p>
        </div>
        <Badge variant="secondary">演示预览</Badge>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardDemoData.metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="mt-2 text-3xl">{metric.value}</CardTitle>
                </div>
                <div className={cn("rounded-md p-2", metricToneClass[metric.tone])}>
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{metric.helper}</span>
                  <span className="font-medium text-foreground">{metric.trend}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>今日课程</CardTitle>
            <CardDescription>按时间查看待上课与待点名课程。</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable<DashboardScheduleItem>
              columns={[
                { key: "time", header: "时间", cell: (row) => row.time },
                { key: "title", header: "课程", cell: (row) => row.title },
                { key: "meta", header: "教师 / 校区", cell: (row) => row.meta },
                {
                  key: "status",
                  header: "状态",
                  cell: (row) => <Badge variant="outline">{row.status}</Badge>,
                },
              ]}
              data={dashboardDemoData.todaySchedules}
              getRowKey={(row) => `${row.time}-${row.title}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>待办提醒</CardTitle>
            <CardDescription>今日需要优先处理的运营事项。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {dashboardDemoData.todos.map((todo) => (
                <div key={todo.title} className="rounded-lg border bg-background p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{todo.title}</p>
                    <Badge variant={priorityVariant[todo.priority]}>{todo.priority}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{todo.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>本周排课</CardTitle>
          <CardDescription>每日课程量分布，用于快速识别高峰日。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {dashboardDemoData.weeklyPlan.map((item) => (
              <div key={item.day} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3">
                <span className="text-sm text-muted-foreground">{item.day}</span>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.round((item.lessons / maxLessons) * 100)}%` }}
                  />
                </div>
                <span className="text-right text-sm font-medium">{item.lessons} 节</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { DashboardDemo };
