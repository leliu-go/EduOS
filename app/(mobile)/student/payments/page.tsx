import { PaymentList } from "@/features/payments/payment-list";
import { getStudentPaymentList } from "@/features/payments/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function StudentPaymentsPage() {
  const currentUser = await requirePermission("payments:viewOwn", {
    nextPath: "/student/payments",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const payments = await getStudentPaymentList(currentUser.tenantId, currentUser.id);

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-base font-semibold tracking-normal text-foreground">支付状态</h2>
        <p className="mt-1 text-sm text-muted-foreground">仅显示与你本人课程订单相关的支付记录。</p>
      </div>
      <PaymentList payments={payments} />
    </div>
  );
}
