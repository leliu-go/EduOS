import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudentHomeworkList } from "@/features/homework/queries";
import { HomeworkSubmissionForm } from "@/features/homework/homework-submission-form";
import { requirePermission } from "@/lib/rbac/require-permission";

type StudentHomework = Awaited<ReturnType<typeof getStudentHomeworkList>>[number];

function formatDateTime(value: Date) {
  return `${value.toISOString().slice(0, 10)} ${value.toISOString().slice(11, 16)}`;
}

function getTargetLabel(homework: StudentHomework) {
  if (homework.lesson) {
    return `课次：${homework.lesson.title}`;
  }

  if (homework.classGroup) {
    return `班级：${homework.classGroup.name}`;
  }

  return "个人作业";
}

function getLatestSubmission(homework: StudentHomework) {
  return homework.submissions[0];
}

function StudentHomeworkCard({ homework }: { homework: StudentHomework }) {
  const latestSubmission = getLatestSubmission(homework);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{homework.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{getTargetLabel(homework)}</p>
          </div>
          <Badge variant={latestSubmission ? "secondary" : "outline"}>
            {latestSubmission ? latestSubmission.status : "待提交"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm text-muted-foreground">
        <div className="grid gap-2">
          <p>截止时间：{formatDateTime(homework.dueAt)}</p>
          <p>{homework.instructions}</p>
          {latestSubmission ? (
            <p>
              最近提交：第 {latestSubmission.attemptNumber} 次，
              {formatDateTime(latestSubmission.submittedAt)}
            </p>
          ) : null}
        </div>
        <HomeworkSubmissionForm homeworkId={homework.id} />
      </CardContent>
    </Card>
  );
}

export default async function StudentHomeworkPage() {
  const currentUser = await requirePermission("homework:submit", {
    nextPath: "/student/homework",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const homeworkItems = await getStudentHomeworkList(currentUser.tenantId, currentUser.id);

  if (homeworkItems.length === 0) {
    return (
      <EmptyState title="暂无作业" description="老师布置作业后，可在这里查看要求并提交完成情况。" />
    );
  }

  return (
    <section className="grid gap-3">
      <h2 className="text-base font-semibold tracking-normal text-foreground">作业</h2>
      {homeworkItems.map((homework) => (
        <StudentHomeworkCard key={homework.id} homework={homework} />
      ))}
    </section>
  );
}
