import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { HomeworkCreateDialog } from "@/features/homework/homework-create-dialog";
import { getHomeworkAssignmentOptions, getTeacherHomeworkList } from "@/features/homework/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

type TeacherHomework = Awaited<ReturnType<typeof getTeacherHomeworkList>>[number];

function formatDateTime(value: Date) {
  return `${value.toISOString().slice(0, 10)} ${value.toISOString().slice(11, 16)}`;
}

function getTargetLabel(homework: TeacherHomework) {
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

function TeacherHomeworkCard({ homework }: { homework: TeacherHomework }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{homework.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{getTargetLabel(homework)}</p>
          </div>
          <Badge variant="secondary">{homework._count.submissions} 份提交</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        <p>截止时间：{formatDateTime(homework.dueAt)}</p>
        <p className="line-clamp-2">{homework.instructions}</p>
      </CardContent>
    </Card>
  );
}

export default async function TeacherHomeworkPage() {
  const currentUser = await requirePermission("homework:manage", {
    nextPath: "/teacher/homework",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const [homeworkItems, options] = await Promise.all([
    getTeacherHomeworkList(currentUser.tenantId, currentUser.id),
    getHomeworkAssignmentOptions(currentUser.tenantId, { teacherUserId: currentUser.id }),
  ]);

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-normal text-foreground">作业</h2>
          <p className="mt-1 text-sm text-muted-foreground">给自己的班级、课次或学生布置作业。</p>
        </div>
        <HomeworkCreateDialog options={options} returnTo="/teacher/homework" />
      </div>

      {homeworkItems.length > 0 ? (
        homeworkItems.map((homework) => (
          <TeacherHomeworkCard key={homework.id} homework={homework} />
        ))
      ) : (
        <EmptyState title="暂无作业" description="布置作业后，可在这里查看截止时间和提交数量。" />
      )}
    </div>
  );
}
