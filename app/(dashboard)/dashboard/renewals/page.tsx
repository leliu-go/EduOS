import { AlertTriangle, ClipboardCheck, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getRenewalFollowUpList,
  renewalPriorityLabels,
  renewalTriggerLabels,
  type RenewalTrigger,
} from "@/features/renewals/renewal-warning";
import { requirePermission } from "@/lib/rbac/require-permission";

const triggerIcons = {
  LOW_BALANCE: AlertTriangle,
  NEAR_COURSE_END: ClipboardCheck,
  LOW_ATTENDANCE: AlertTriangle,
  STRONG_PROGRESS: TrendingUp,
} as const satisfies Record<RenewalTrigger, typeof AlertTriangle>;

export default async function RenewalWarningPage() {
  const currentUser = await requirePermission("reports:institution:view", {
    nextPath: "/dashboard/renewals",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const followUps = await getRenewalFollowUpList(currentUser.tenantId, {
    campusId: currentUser.campusId,
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">续费预警</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            根据课时余额、到课表现和作业进展生成续费跟进名单。
          </p>
        </div>
        <Badge variant="secondary">{followUps.length} 条跟进</Badge>
      </div>

      {followUps.length > 0 ? (
        <section className="grid gap-4">
          {followUps.map((item) => (
            <Card key={item.id} className="shadow-none">
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle>{item.student.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.courseProduct.name} · {item.courseProduct.subject.name}/
                      {item.courseProduct.grade.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.classGroup?.name ?? "未绑定班级"} · {item.campus?.name ?? "机构范围"}
                    </p>
                  </div>
                  <Badge variant={item.priority === "HIGH" ? "destructive" : "secondary"}>
                    {renewalPriorityLabels[item.priority]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex flex-wrap gap-2">
                  {item.triggers.map((trigger) => {
                    const Icon = triggerIcons[trigger];

                    return (
                      <Badge key={trigger} variant="outline" className="gap-1">
                        <Icon className="size-3" aria-hidden="true" />
                        {renewalTriggerLabels[trigger]}
                      </Badge>
                    );
                  })}
                </div>
                <div className="grid gap-3 text-sm md:grid-cols-4">
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">剩余课时</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {item.balance.remainingHours}/{item.balance.totalHours}
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">到课率</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {item.attendanceRate}% · {item.attendanceTotal} 次
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">作业完成</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {item.homeworkCompletionRate}% · {item.homeworkTotal} 份
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">建议动作</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {item.triggers.includes("STRONG_PROGRESS") ? "展示成长反馈" : "联系家长跟进"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : (
        <EmptyState title="暂无续费预警" description="当前没有需要跟进的低课时或续费机会。" />
      )}
    </div>
  );
}
