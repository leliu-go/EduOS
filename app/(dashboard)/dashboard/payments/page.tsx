import Link from "next/link";
import { FileClock, ReceiptText, RotateCcw, ScrollText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentCreateDialog } from "@/features/payments/payment-create-dialog";
import { PaymentList } from "@/features/payments/payment-list";
import { getManualPaymentOptions, getStaffPaymentList } from "@/features/payments/queries";
import { hasPermission } from "@/lib/rbac/permissions";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function DashboardPaymentsPage() {
  const currentUser = await requirePermission("finance:reports:view", {
    nextPath: "/dashboard/payments",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const canMutateFinance = hasPermission(currentUser.roleKey, "finance:mutate");
  const [payments, paymentOptions] = await Promise.all([
    getStaffPaymentList(currentUser.tenantId),
    canMutateFinance
      ? getManualPaymentOptions(currentUser.tenantId)
      : Promise.resolve({ orders: [] }),
  ]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">支付流水</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            人工录入收款、跟进待确认流水，并把现金流入与课消收入分开核对。
          </p>
        </div>
        <Badge variant="secondary">{payments.length} 条记录</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canMutateFinance ? <PaymentCreateDialog orders={paymentOptions.orders} /> : null}
        <Button asChild variant="outline">
          <Link href="/dashboard/enrollments">
            <ReceiptText className="size-4" aria-hidden="true" />
            新建订单
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/enrollments">
            <RotateCcw className="size-4" aria-hidden="true" />
            续费
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/payments?mode=refund">
            <FileClock className="size-4" aria-hidden="true" />
            退款申请
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/course-consumptions">
            <ScrollText className="size-4" aria-hidden="true" />
            课消冲正
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/settings/security">查看审计日志</Link>
        </Button>
      </div>

      <Card className="shadow-none">
        <CardContent className="grid gap-3 p-4 text-sm text-muted-foreground md:grid-cols-3">
          <p>新增收款只记录线下现金流入，不会连接真实支付接口。</p>
          <p>课消流水才是收入确认依据，错误课消请走冲正。</p>
          <p>退款和财务调整必须保留原因与审计日志。</p>
        </CardContent>
      </Card>

      <PaymentList payments={payments} />
    </div>
  );
}
