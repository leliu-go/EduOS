import { EmptyState } from "@/components/ui/empty-state";
import { CourseConsumptionLedgerCard } from "@/features/course-consumptions/ledger-card";
import { getParentCourseConsumptionLedger } from "@/features/course-consumptions/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function ParentConsumptionLedgerPage() {
  const currentUser = await requirePermission("route:parent", {
    nextPath: "/parent",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const ledger = await getParentCourseConsumptionLedger(currentUser.tenantId, currentUser.id);

  if (ledger.length === 0) {
    return (
      <EmptyState
        title="暂无课消记录"
        description="孩子完成考勤并扣课后，可在这里查看扣课历史和当前余额。"
      />
    );
  }

  return (
    <section className="grid gap-3">
      <h2 className="text-base font-semibold tracking-normal text-foreground">课消记录</h2>
      {ledger.map((item) => (
        <CourseConsumptionLedgerCard key={item.id} item={item} showStudent />
      ))}
    </section>
  );
}
