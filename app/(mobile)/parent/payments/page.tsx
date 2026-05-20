import { PaymentList } from "@/features/payments/payment-list";
import { getParentPaymentList } from "@/features/payments/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function ParentPaymentsPage() {
  const currentUser = await requirePermission("payments:viewOwn", {
    nextPath: "/parent/payments",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const payments = await getParentPaymentList(currentUser.tenantId, currentUser.id);

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-base font-semibold tracking-normal text-foreground">支付状态</h2>
        <p className="mt-1 text-sm text-muted-foreground">仅显示已绑定学生的课程订单支付记录。</p>
      </div>
      <PaymentList payments={payments} />
    </div>
  );
}
