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
            汇总支付、退款、课消收入估算与剩余课时负债，用于基础财务核对。
          </p>
        </div>
        <Button asChild>
          <a href="/dashboard/finance-reports/export">
            <Download className="size-4" aria-hidden="true" />
            导出 CSV
          </a>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="已确认收款"
          value={formatCurrency(summary.payments.confirmedAmount)}
          description={`待确认 ${formatCurrency(summary.payments.pendingAmount)} · 共 ${summary.payments.count} 笔`}
        />
        <MetricCard
          title="已审批退款"
          value={formatCurrency(summary.refunds.approvedAmount)}
          description={`待审批 ${formatCurrency(summary.refunds.pendingAmount)} · 共 ${summary.refunds.count} 笔`}
        />
        <MetricCard
          title="课消收入估算"
          value={formatCurrency(summary.courseConsumptionRevenue.estimatedRevenue)}
          description={`有效课消 ${summary.courseConsumptionRevenue.consumedHours} 课时`}
        />
        <MetricCard
          title="剩余课时负债"
          value={`${summary.remainingCourseLiability.remainingHours} 课时`}
          description={`覆盖 ${summary.remainingCourseLiability.accountCount} 个有效课时账户`}
        />
      </section>
    </div>
  );
}
