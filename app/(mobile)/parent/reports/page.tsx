import { EmptyState } from "@/components/ui/empty-state";
import { getParentLearningReports } from "@/features/reports/student-learning-report";
import { StudentLearningReportCard } from "@/features/reports/student-learning-report-card";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function ParentReportsPage() {
  const currentUser = await requirePermission("route:parent", {
    nextPath: "/parent/reports",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const reports = await getParentLearningReports(currentUser.tenantId, currentUser.id);

  if (reports.length === 0) {
    return <EmptyState title="暂无学习报告" description="绑定孩子后，可查看孩子的学习报告。" />;
  }

  return (
    <section className="grid gap-4">
      <h2 className="text-base font-semibold tracking-normal text-foreground">学习报告</h2>
      {reports.map((report) => (
        <StudentLearningReportCard key={report.student.id} report={report} />
      ))}
    </section>
  );
}
