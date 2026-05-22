import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { HomeworkCreateDialog } from "@/features/homework/homework-create-dialog";
import { getHomeworkAssignmentOptions, getStaffHomeworkList } from "@/features/homework/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

type StaffHomework = Awaited<ReturnType<typeof getStaffHomeworkList>>[number];

function formatDateTime(value: Date) {
  return `${value.toISOString().slice(0, 10)} ${value.toISOString().slice(11, 16)}`;
}

function getTargetLabel(homework: StaffHomework) {
  if (homework.lesson) {
    return `课次：${homework.lesson.title}`;
  }

  if (homework.classGroup) {
    return `班级：${homework.classGroup.name}`;
  }

  if (homework.student) {
    return `学生：${homework.student.name}`;
  }

  return "未设置对象";
}

function StaffHomeworkCard({ homework }: { homework: StaffHomework }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{homework.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{getTargetLabel(homework)}</p>
          </div>
          <Badge variant="secondary">{homework.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        <p>截止时间：{formatDateTime(homework.dueAt)}</p>
        <p>已提交：{homework._count.submissions} 份</p>
        <p className="line-clamp-2">{homework.instructions}</p>
      </CardContent>
    </Card>
  );
}

export default async function StaffHomeworkPage() {
  const currentUser = await requirePermission("homework:manage", {
    nextPath: "/dashboard/homework",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const [homeworkItems, options] = await Promise.all([
    getStaffHomeworkList(currentUser.tenantId),
    getHomeworkAssignmentOptions(currentUser.tenantId),
  ]);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="作业管理"
        description="给班级、课次或单个学生布置作业，并跟进提交、批改和订正状态。"
        badge={`${homeworkItems.length} 项作业`}
        actions={<HomeworkCreateDialog options={options} returnTo="/dashboard/homework" />}
      />

      {homeworkItems.length > 0 ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {homeworkItems.map((homework) => (
            <StaffHomeworkCard key={homework.id} homework={homework} />
          ))}
        </section>
      ) : (
        <EmptyState title="暂无作业" description="布置作业后，可在这里查看截止时间和提交数量。" />
      )}
    </div>
  );
}
