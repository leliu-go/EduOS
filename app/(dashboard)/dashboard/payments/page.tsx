import { Badge } from "@/components/ui/badge";
import { PaymentList } from "@/features/payments/payment-list";
import { getStaffPaymentList } from "@/features/payments/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function DashboardPaymentsPage() {
  const currentUser = await requirePermission("finance:reports:view", {
    nextPath: "/dashboard/payments",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const payments = await getStaffPaymentList(currentUser.tenantId);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">支付流水</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            查看租户内订单收款记录，支持财务对账与支付状态跟进。
          </p>
        </div>
        <Badge variant="secondary">{payments.length} 条记录</Badge>
      </div>

      <PaymentList payments={payments} />
    </div>
  );
}
