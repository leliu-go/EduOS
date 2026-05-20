import { BookOpen, MessageSquareText, UserCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { calculateCourseAccountBalance } from "@/features/course-accounts/balance";
import { getParentCourseAccounts } from "@/features/course-accounts/queries";
import { homeworkCorrectionStatusLabels } from "@/features/homework/homework-schema";
import {
  getParentHomeworkCorrections,
  getParentHomeworkReminders,
} from "@/features/homework/queries";
import { homeworkReminderStatusLabels } from "@/features/homework/reminders";
import { getParentLessonFeedback } from "@/features/lesson-feedback/queries";
import { getParentTimetable } from "@/features/scheduling/portal-queries";
import { TimetableCard } from "@/features/scheduling/timetable-card";
import { requirePermission } from "@/lib/rbac/require-permission";

type ParentHomeworkReminder = Awaited<ReturnType<typeof getParentHomeworkReminders>>[number];
type ParentLessonFeedback = Awaited<ReturnType<typeof getParentLessonFeedback>>[number];

function formatDateTime(value: Date) {
  return `${value.toISOString().slice(0, 10)} ${value.toISOString().slice(11, 16)}`;
}

function ParentHomeworkReminderCard({ reminder }: { reminder: ParentHomeworkReminder }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{reminder.homework.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{reminder.student.name}</p>
          </div>
          <Badge variant={reminder.status === "OVERDUE" ? "destructive" : "secondary"}>
            {homeworkReminderStatusLabels[reminder.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        <p>截止时间：{formatDateTime(reminder.homework.dueAt)}</p>
        <p className="line-clamp-2">{reminder.homework.instructions}</p>
      </CardContent>
    </Card>
  );
}

function ParentLessonFeedbackCard({ feedback }: { feedback: ParentLessonFeedback }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{feedback.lesson.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {feedback.student.name} · {feedback.lesson.classGroup.name}
            </p>
          </div>
          <Badge variant="secondary">{feedback.teacher.name}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        <p>课堂内容：{feedback.content}</p>
        <p>课堂表现：{feedback.performance}</p>
        <p>掌握情况：{feedback.mastery}</p>
        <p>课后作业：{feedback.homework}</p>
        <p>学习建议：{feedback.suggestion}</p>
      </CardContent>
    </Card>
  );
}

export default async function ParentHomePage() {
  const currentUser = await requirePermission("route:parent", {
    nextPath: "/parent",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const [accounts, timetable, homeworkCorrections, homeworkReminders, lessonFeedbacks] =
    await Promise.all([
      getParentCourseAccounts(currentUser.tenantId, currentUser.id),
      getParentTimetable(currentUser.tenantId, currentUser.id),
      getParentHomeworkCorrections(currentUser.tenantId, currentUser.id),
      getParentHomeworkReminders(currentUser.tenantId, currentUser.id),
      getParentLessonFeedback(currentUser.tenantId, currentUser.id),
    ]);

  if (
    accounts.length === 0 &&
    timetable.length === 0 &&
    homeworkCorrections.length === 0 &&
    homeworkReminders.length === 0 &&
    lessonFeedbacks.length === 0
  ) {
    return (
      <EmptyState
        title="暂无学习动态"
        description="绑定孩子报名后，可在这里查看课表、课时和作业反馈。"
      />
    );
  }

  return (
    <div className="grid gap-4">
      {timetable.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-base font-semibold tracking-normal text-foreground">孩子课表</h2>
          {timetable.map((schedule) => {
            const studentNames = schedule.classGroup.students
              .map((classGroupStudent) => classGroupStudent.student.name)
              .join("、");

            return (
              <TimetableCard
                key={schedule.id}
                title={schedule.lesson?.title ?? schedule.classGroup.name}
                courseName={schedule.classGroup.courseProduct.name}
                startAt={schedule.startAt}
                endAt={schedule.endAt}
                status={schedule.status}
                campusName={schedule.campus.name}
                classGroupName={schedule.classGroup.name}
                teacherName={schedule.teacher.name}
                studentNames={studentNames}
              />
            );
          })}
        </section>
      ) : null}

      {homeworkReminders.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-base font-semibold tracking-normal text-foreground">作业提醒</h2>
          {homeworkReminders.map((reminder) => (
            <ParentHomeworkReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </section>
      ) : null}

      {lessonFeedbacks.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-base font-semibold tracking-normal text-foreground">课后反馈</h2>
          {lessonFeedbacks.map((feedback) => (
            <ParentLessonFeedbackCard key={feedback.id} feedback={feedback} />
          ))}
        </section>
      ) : null}

      {homeworkCorrections.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-base font-semibold tracking-normal text-foreground">作业反馈</h2>
          {homeworkCorrections.map((homeworkCorrection) => (
            <Card key={homeworkCorrection.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{homeworkCorrection.submission.homework.title}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {homeworkCorrection.submission.student.name} · 第{" "}
                      {homeworkCorrection.submission.attemptNumber} 次提交
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {homeworkCorrectionStatusLabels[homeworkCorrection.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MessageSquareText className="size-4" aria-hidden="true" />
                  {formatDateTime(homeworkCorrection.correctedAt)}
                  {homeworkCorrection.teacher ? ` · ${homeworkCorrection.teacher.name}` : ""}
                </p>
                {homeworkCorrection.score !== null ? <p>分数：{homeworkCorrection.score}</p> : null}
                {homeworkCorrection.comment ? <p>{homeworkCorrection.comment}</p> : null}
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      {accounts.map((account) => {
        const balance = calculateCourseAccountBalance(account);

        return (
          <Card key={account.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{account.courseProduct.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {account.courseProduct.subject.name} · {account.courseProduct.grade.name}
                  </p>
                </div>
                <Badge variant="secondary">剩余 {balance.remainingHours} 课时</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <UserCircle className="size-4" aria-hidden="true" />
                {account.student.name}
              </p>
              <p className="flex items-center gap-2">
                <BookOpen className="size-4" aria-hidden="true" />
                已购 {account.purchasedHours} · 赠送 {account.giftHours} · 已用 {account.usedHours}{" "}
                · 冻结 {account.frozenHours}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
