import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { HomeworkCorrectionDialog } from "@/features/homework/homework-correction-dialog";
import { HomeworkCreateDialog } from "@/features/homework/homework-create-dialog";
import {
  getHomeworkAssignmentOptions,
  getTeacherHomeworkList,
  getTeacherHomeworkSubmissionsForCorrection,
  getTeacherNotSubmittedHomework,
} from "@/features/homework/queries";
import { homeworkReminderStatusLabels } from "@/features/homework/reminders";
import { requirePermission } from "@/lib/rbac/require-permission";

type TeacherHomework = Awaited<ReturnType<typeof getTeacherHomeworkList>>[number];
type TeacherCorrectionSubmission = Awaited<
  ReturnType<typeof getTeacherHomeworkSubmissionsForCorrection>
>[number];
type TeacherNotSubmittedHomework = Awaited<
  ReturnType<typeof getTeacherNotSubmittedHomework>
>[number];
type HomeworkTarget = {
  classGroup: { name: string } | null;
  lesson: { title: string } | null;
  student: { name: string } | null;
};

function formatDateTime(value: Date) {
  return `${value.toISOString().slice(0, 10)} ${value.toISOString().slice(11, 16)}`;
}

function getTargetLabel(homework: HomeworkTarget) {
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

function getSubmissionTargetLabel(submission: TeacherCorrectionSubmission) {
  if (submission.homework.lesson) {
    return `课次：${submission.homework.lesson.title}`;
  }

  if (submission.homework.classGroup) {
    return `班级：${submission.homework.classGroup.name}`;
  }

  return "个人作业";
}

function TeacherCorrectionCard({ submission }: { submission: TeacherCorrectionSubmission }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{submission.homework.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {submission.student.name} · {getSubmissionTargetLabel(submission)}
            </p>
          </div>
          <HomeworkCorrectionDialog submission={submission} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        <p>
          第 {submission.attemptNumber} 次提交 · {formatDateTime(submission.submittedAt)}
        </p>
        {submission.contentText ? <p className="line-clamp-2">{submission.contentText}</p> : null}
      </CardContent>
    </Card>
  );
}

function TeacherNotSubmittedCard({ item }: { item: TeacherNotSubmittedHomework }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{item.homework.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.student.name} · {getTargetLabel(item.homework)}
            </p>
          </div>
          <Badge variant={item.status === "OVERDUE" ? "destructive" : "secondary"}>
            {homeworkReminderStatusLabels[item.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        <p>截止时间：{formatDateTime(item.homework.dueAt)}</p>
        <p className="line-clamp-2">{item.homework.instructions}</p>
      </CardContent>
    </Card>
  );
}

export default async function TeacherHomeworkPage() {
  const currentUser = await requirePermission("homework:manage", {
    nextPath: "/teacher/homework",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const [homeworkItems, pendingSubmissions, notSubmittedItems, options] = await Promise.all([
    getTeacherHomeworkList(currentUser.tenantId, currentUser.id),
    getTeacherHomeworkSubmissionsForCorrection(currentUser.tenantId, currentUser.id),
    getTeacherNotSubmittedHomework(currentUser.tenantId, currentUser.id),
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

      <section className="grid gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-normal text-foreground">待批改提交</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            只显示自己班级、课次或学生的待批改作业。
          </p>
        </div>
        {pendingSubmissions.length > 0 ? (
          pendingSubmissions.map((submission) => (
            <TeacherCorrectionCard key={submission.id} submission={submission} />
          ))
        ) : (
          <EmptyState title="暂无待批改" description="学生提交作业后，会在这里进入批改流程。" />
        )}
      </section>

      <section className="grid gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-normal text-foreground">未提交名单</h3>
          <p className="mt-1 text-xs text-muted-foreground">按学生列出仍需提交或已逾期的作业。</p>
        </div>
        {notSubmittedItems.length > 0 ? (
          notSubmittedItems.map((item) => <TeacherNotSubmittedCard key={item.id} item={item} />)
        ) : (
          <EmptyState title="暂无未提交" description="学生都提交后，这里会保持为空。" />
        )}
      </section>

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
