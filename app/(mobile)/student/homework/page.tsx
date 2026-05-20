import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  homeworkCorrectionStatusLabels,
  homeworkSubmissionStatusLabels,
} from "@/features/homework/homework-schema";
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

function getLatestCorrection(homework: StudentHomework) {
  return getLatestSubmission(homework)?.corrections[0];
}

function canSubmitRevision(latestSubmission: ReturnType<typeof getLatestSubmission>) {
  return !latestSubmission || latestSubmission.status === "NEEDS_REVISION";
}

function StudentHomeworkCard({ homework }: { homework: StudentHomework }) {
  const latestSubmission = getLatestSubmission(homework);
  const latestCorrection = getLatestCorrection(homework);
  const canSubmit = canSubmitRevision(latestSubmission);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{homework.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{getTargetLabel(homework)}</p>
          </div>
          <Badge variant={latestSubmission ? "secondary" : "outline"}>
            {latestSubmission ? homeworkSubmissionStatusLabels[latestSubmission.status] : "待提交"}
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
        {latestCorrection ? (
          <div className="grid gap-2 rounded-md border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-foreground">批改反馈</p>
              <Badge variant="secondary">
                {homeworkCorrectionStatusLabels[latestCorrection.status]}
              </Badge>
            </div>
            {latestCorrection.score !== null ? <p>分数：{latestCorrection.score}</p> : null}
            {latestCorrection.comment ? <p>{latestCorrection.comment}</p> : null}
          </div>
        ) : null}
        {homework.submissions.length > 0 ? (
          <div className="grid gap-2 rounded-md border p-3">
            <p className="font-medium text-foreground">提交记录</p>
            {homework.submissions.map((submission) => {
              const correction = submission.corrections[0];

              return (
                <div key={submission.id} className="grid gap-1 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      第 {submission.attemptNumber} 次 · {formatDateTime(submission.submittedAt)}
                    </span>
                    <Badge variant="outline">
                      {homeworkSubmissionStatusLabels[submission.status]}
                    </Badge>
                  </div>
                  {correction ? (
                    <p>
                      反馈：{homeworkCorrectionStatusLabels[correction.status]}
                      {correction.score !== null ? ` · ${correction.score} 分` : ""}
                      {correction.comment ? ` · ${correction.comment}` : ""}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
        {canSubmit ? (
          <HomeworkSubmissionForm
            homeworkId={homework.id}
            mode={latestSubmission ? "revise" : "submit"}
          />
        ) : (
          <p className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
            {latestSubmission?.status === "CORRECTED"
              ? "作业已完成，无需再次提交。"
              : "已提交，等待老师批改。"}
          </p>
        )}
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
