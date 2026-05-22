import Link from "next/link";
import { ReceiptText, RotateCcw, ScrollText, WalletCards } from "lucide-react";

import { FlowStepCard } from "@/components/dashboard/FlowStepCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentCreateDialog } from "@/features/payments/payment-create-dialog";
import { PaymentList } from "@/features/payments/payment-list";
import { getManualPaymentOptions, getStaffPaymentList } from "@/features/payments/queries";
import { RefundApprovalPanel, RefundRequestDialog } from "@/features/refunds/refund-dialogs";
import { getRefundWorkflowOptions } from "@/features/refunds/queries";
import { hasPermission } from "@/lib/rbac/permissions";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function DashboardPaymentsPage() {
  const currentUser = await requirePermission("finance:reports:view", {
    nextPath: "/dashboard/payments",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const canMutateFinance = hasPermission(currentUser.roleKey, "finance:mutate");
  const [payments, paymentOptions, refundOptions] = await Promise.all([
    getStaffPaymentList(currentUser.tenantId),
    canMutateFinance
      ? getManualPaymentOptions(currentUser.tenantId)
      : Promise.resolve({ orders: [] }),
    canMutateFinance
      ? getRefundWorkflowOptions(currentUser.tenantId)
      : Promise.resolve({ courseAccounts: [], orders: [], payments: [], pendingRefunds: [] }),
  ]);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="支付流水"
        description="人工录入收款、跟进待确认流水，并把现金流入与课消收入分开核对。"
        badge={`${payments.length} 条记录`}
        actions={
          <>
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
            {canMutateFinance ? <RefundRequestDialog options={refundOptions} /> : null}
            <Button asChild variant="outline">
              <Link href="/dashboard/course-consumptions">
                <ScrollText className="size-4" aria-hidden="true" />
                课消冲正
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/settings/security">查看审计日志</Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FlowStepCard
          title="1. 创建订单"
          description="从报名或续费进入订单流程，保留课程、学生和课时关系。"
          href="/dashboard/enrollments"
          icon={ReceiptText}
          tone="primary"
        />
        <FlowStepCard
          title="2. 录入收款"
          description="只记录线下人工收款，不接真实微信、支付宝或短信支付。"
          icon={WalletCards}
          tone="success"
        />
        <FlowStepCard
          title="3. 核对课消"
          description="课消流水才是收入确认依据，异常需走冲正。"
          href="/dashboard/course-consumptions"
          icon={ScrollText}
          tone="info"
        />
        <FlowStepCard
          title="4. 退款留痕"
          description="退款与调整必须写原因和审计日志，不删除原流水。"
          icon={RotateCcw}
          tone="warning"
        />
      </section>

      <Card className="shadow-none">
        <CardContent className="grid gap-3 p-4 text-sm text-muted-foreground md:grid-cols-3">
          <p>新增收款只记录线下现金流入，不会连接真实支付接口。</p>
          <p>课消流水才是收入确认依据，错误课消请走冲正。</p>
          <p>退款和财务调整必须保留原因与审计日志。</p>
        </CardContent>
      </Card>

      {canMutateFinance ? <RefundApprovalPanel options={refundOptions} /> : null}

      <PaymentList payments={payments} />
    </div>
  );
}
