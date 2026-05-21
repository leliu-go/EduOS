import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFinanceReportSummary } from "@/features/finance-reports/report";
import { requirePermission } from "@/lib/rbac/require-permission";

function formatCurrency(value: number) {
  return `CNY ${value.toFixed(2)}`;
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-normal text-foreground">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default async function FinanceReportsPage() {
  const currentUser = await requirePermission("finance:reports:view", {
    nextPath: "/dashboard/finance-reports",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const summary = await getFinanceReportSummary(currentUser.tenantId);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">财务报表</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            区分实收现金、已课消收入、未消课余额、退款和欠费，避免把收款直接当成收入。
          </p>
        </div>
        <Button asChild>
          <a href="/dashboard/finance-reports/export">
            <Download className="size-4" aria-hidden="true" />
            导出 CSV
          </a>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="实收金额"
          value={formatCurrency(summary.payments.confirmedAmount)}
          description={`待确认 ${formatCurrency(summary.payments.pendingAmount)} / 共 ${summary.payments.count} 笔`}
        />
        <MetricCard
          title="已课消收入"
          value={formatCurrency(summary.courseConsumptionRevenue.estimatedRevenue)}
          description={`有效课消 ${summary.courseConsumptionRevenue.consumedHours} 课时`}
        />
        <MetricCard
          title="未消课余额"
          value={`${summary.remainingCourseLiability.remainingHours} 课时`}
          description={`覆盖 ${summary.remainingCourseLiability.accountCount} 个有效课时账户`}
        />
        <MetricCard
          title="退款金额"
          value={formatCurrency(summary.refunds.approvedAmount)}
          description={`待审核 ${formatCurrency(summary.refunds.pendingAmount)} / 共 ${summary.refunds.count} 笔`}
        />
        <MetricCard
          title="欠费/应收"
          value={formatCurrency(summary.receivables.pendingOrderAmount)}
          description={`待付款订单 ${summary.receivables.pendingOrderCount} 笔`}
        />
      </section>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">报表口径</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          <p>实收金额来自已确认 Payment，是现金流入。</p>
          <p>已课消收入来自有效 CourseConsumption，是服务交付后的收入确认估算。</p>
          <p>未消课余额代表尚未交付的课时负债，退款和冲正不得删除原始流水。</p>
        </CardContent>
      </Card>
    </div>
  );
}
