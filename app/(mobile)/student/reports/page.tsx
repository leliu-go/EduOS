import { EmptyState } from "@/components/ui/empty-state";
import { getStudentLearningReport } from "@/features/reports/student-learning-report";
import { StudentLearningReportCard } from "@/features/reports/student-learning-report-card";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function StudentReportsPage() {
  const currentUser = await requirePermission("route:student", {
    nextPath: "/student/reports",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const report = await getStudentLearningReport(currentUser.tenantId, currentUser.id);

  if (!report) {
    return <EmptyState title="暂无学习报告" description="绑定学生档案后，可查看学习报告。" />;
  }

  return (
    <section className="grid gap-3">
      <h2 className="text-base font-semibold tracking-normal text-foreground">学习报告</h2>
      <StudentLearningReportCard report={report} />
    </section>
  );
}
