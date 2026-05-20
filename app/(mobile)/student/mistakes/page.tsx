import { EmptyState } from "@/components/ui/empty-state";
import { ErrorRecordCard } from "@/features/mistakes/error-record-card";
import { ErrorReasonStats } from "@/features/mistakes/error-reason-stats-card";
import { MistakeCorrectionActionForm } from "@/features/mistakes/mistake-correction-form";
import { getStudentErrorReasonStats, getStudentErrorRecords } from "@/features/mistakes/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function StudentMistakesPage() {
  const currentUser = await requirePermission("mistakes:viewOwn", {
    nextPath: "/student/mistakes",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const [records, errorReasonStats] = await Promise.all([
    getStudentErrorRecords(currentUser.tenantId, currentUser.id),
    getStudentErrorReasonStats(currentUser.tenantId, currentUser.id),
  ]);

  if (records.length === 0) {
    return (
      <section className="grid gap-4">
        <ErrorReasonStats title="错因统计" stats={errorReasonStats} />
        <EmptyState
          title="暂无错题记录"
          description="老师记录错题后，可在这里查看知识点、原因和订正状态。"
        />
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <ErrorReasonStats title="错因统计" stats={errorReasonStats} />
      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-normal text-foreground">我的错题</h2>
        {records.map((item) => (
          <ErrorRecordCard
            key={item.id}
            item={item}
            action={
              item.status === "PENDING_CORRECTION" ? (
                <MistakeCorrectionActionForm
                  errorRecordId={item.id}
                  intent="submit"
                  returnTo="/student/mistakes"
                />
              ) : null
            }
          />
        ))}
      </section>
    </section>
  );
}
