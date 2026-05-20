import { EmptyState } from "@/components/ui/empty-state";
import { ErrorRecordCard } from "@/features/mistakes/error-record-card";
import { ErrorReasonStats } from "@/features/mistakes/error-reason-stats-card";
import { getParentErrorReasonStats, getParentErrorRecords } from "@/features/mistakes/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function ParentMistakesPage() {
  const currentUser = await requirePermission("mistakes:viewOwn", {
    nextPath: "/parent/mistakes",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const [records, errorReasonStats] = await Promise.all([
    getParentErrorRecords(currentUser.tenantId, currentUser.id),
    getParentErrorReasonStats(currentUser.tenantId, currentUser.id),
  ]);

  if (records.length === 0) {
    return (
      <section className="grid gap-4">
        <ErrorReasonStats title="错因统计" stats={errorReasonStats} />
        <EmptyState
          title="暂无错题记录"
          description="孩子产生错题记录后，可在这里查看知识点、原因和订正状态。"
        />
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <ErrorReasonStats title="错因统计" stats={errorReasonStats} />
      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-normal text-foreground">孩子错题</h2>
        {records.map((item) => (
          <ErrorRecordCard key={item.id} item={item} showStudent />
        ))}
      </section>
    </section>
  );
}
