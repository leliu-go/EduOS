import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileText,
  MessageSquareText,
  NotebookPen,
  ReceiptText,
  UserCircle,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { attendanceStatusLabels } from "@/features/attendance/attendance-schema";
import { getParentAttendanceRecords } from "@/features/attendance/queries";
import { getParentContractList } from "@/features/contracts/queries";
import { calculateCourseAccountBalance } from "@/features/course-accounts/balance";
import { getParentCourseAccounts } from "@/features/course-accounts/queries";
import { homeworkCorrectionStatusLabels } from "@/features/homework/homework-schema";
import {
  getParentHomeworkCorrections,
  getParentHomeworkReminders,
} from "@/features/homework/queries";
import { homeworkReminderStatusLabels } from "@/features/homework/reminders";
import { getParentLessonFeedback } from "@/features/lesson-feedback/queries";
import { getParentPaymentList } from "@/features/payments/queries";
import { getParentLearningReports } from "@/features/reports/student-learning-report";
import { getParentTimetable } from "@/features/scheduling/portal-queries";
import { TimetableCard } from "@/features/scheduling/timetable-card";
import { requirePermission } from "@/lib/rbac/require-permission";

type ParentAttendanceRecord = Awaited<ReturnType<typeof getParentAttendanceRecords>>[number];
type ParentHomeworkReminder = Awaited<ReturnType<typeof getParentHomeworkReminders>>[number];
type ParentLessonFeedback = Awaited<ReturnType<typeof getParentLessonFeedback>>[number];

type ParentHomeCardProps = {
  title: string;
  value: string;
  description: string;
  href: string;
  icon: typeof BookOpen;
};

function isSameDay(left: Date, right: Date) {
  return left.toISOString().slice(0, 10) === right.toISOString().slice(0, 10);
}

function formatDateTime(value: Date) {
  return `${value.toISOString().slice(0, 10)} ${value.toISOString().slice(11, 16)}`;
}

function ParentHomeCard({ title, value, description, href, icon: Icon }: ParentHomeCardProps) {
  return (
    <Link href={href} className="block h-full">
      <Card className="h-full shadow-none">
        <CardContent className="grid gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <Icon className="size-4 text-primary" aria-hidden="true" />
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-normal text-foreground">{value}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ParentAttendanceRecordCard({ record }: { record: ParentAttendanceRecord }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>
              {record.schedule.lesson?.title ?? record.schedule.classGroup.name}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {record.student.name} · {record.schedule.classGroup.courseProduct.name}
            </p>
          </div>
          <Badge variant={record.status === "ABSENT" ? "destructive" : "secondary"}>
            {attendanceStatusLabels[record.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {formatDateTime(record.schedule.startAt)}
          {record.schedule.teacher ? ` · ${record.schedule.teacher.name}` : ""}
        </p>
        {record.notes ? <p className="line-clamp-2">{record.notes}</p> : null}
      </CardContent>
    </Card>
  );
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
  const today = new Date();
  const [
    accounts,
    timetable,
    attendanceRecords,
    homeworkCorrections,
    homeworkReminders,
    lessonFeedbacks,
    learningReports,
    payments,
    contracts,
  ] = await Promise.all([
    getParentCourseAccounts(currentUser.tenantId, currentUser.id),
    getParentTimetable(currentUser.tenantId, currentUser.id, today),
    getParentAttendanceRecords(currentUser.tenantId, currentUser.id, { limit: 5 }),
    getParentHomeworkCorrections(currentUser.tenantId, currentUser.id),
    getParentHomeworkReminders(currentUser.tenantId, currentUser.id),
    getParentLessonFeedback(currentUser.tenantId, currentUser.id),
    getParentLearningReports(currentUser.tenantId, currentUser.id),
    getParentPaymentList(currentUser.tenantId, currentUser.id),
    getParentContractList(currentUser.tenantId, currentUser.id, { limit: 20 }),
  ]);
  const todayTimetable = timetable.filter((schedule) => isSameDay(schedule.startAt, today));
  const totalRemainingHours = accounts.reduce((sum, account) => {
    return sum + calculateCourseAccountBalance(account).remainingHours;
  }, 0);
  const homeworkActionCount = homeworkReminders.length + homeworkCorrections.length;
  const pendingPaymentCount = payments.filter((payment) => payment.status !== "CONFIRMED").length;
  const pendingContractCount = contracts.filter(
    (contract) => contract.status === "PENDING_SIGNATURE",
  ).length;
  const hasNoParentData =
    accounts.length === 0 &&
    timetable.length === 0 &&
    attendanceRecords.length === 0 &&
    homeworkCorrections.length === 0 &&
    homeworkReminders.length === 0 &&
    lessonFeedbacks.length === 0 &&
    learningReports.length === 0 &&
    payments.length === 0 &&
    contracts.length === 0;

  return (
    <div className="grid gap-4">
      <section className="grid grid-cols-2 gap-3">
        <ParentHomeCard
          title="孩子今日课程"
          value={`${todayTimetable.length}`}
          description="查看孩子今天的上课安排"
          href="#child-timetable"
          icon={CalendarDays}
        />
        <ParentHomeCard
          title="考勤记录"
          value={`${attendanceRecords.length}`}
          description="关注到课、请假和缺勤情况"
          href="#attendance-records"
          icon={CheckCircle2}
        />
        <ParentHomeCard
          title="剩余课时"
          value={`${totalRemainingHours}`}
          description="查看课消明细和课时余额"
          href="/parent/consumption"
          icon={WalletCards}
        />
        <ParentHomeCard
          title="作业状态"
          value={`${homeworkActionCount}`}
          description="跟进待提交、批改和订正反馈"
          href="#homework-status"
          icon={NotebookPen}
        />
        <ParentHomeCard
          title="学情报告"
          value={`${learningReports.length}`}
          description="查看孩子阶段学习报告"
          href="/parent/reports"
          icon={FileText}
        />
        <ParentHomeCard
          title="缴费合同"
          value={`${pendingPaymentCount + pendingContractCount}`}
          description={`${pendingPaymentCount} 笔缴费 · ${pendingContractCount} 份合同`}
          href="/parent/payments"
          icon={ReceiptText}
        />
      </section>

      {hasNoParentData ? (
        <EmptyState
          title="暂无学习动态"
          description="绑定孩子报名后，可在这里查看课表、课时和作业反馈。"
        />
      ) : null}

      {timetable.length > 0 ? (
        <section id="child-timetable" className="grid gap-3 scroll-mt-4">
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

      {attendanceRecords.length > 0 ? (
        <section id="attendance-records" className="grid gap-3 scroll-mt-4">
          <h2 className="text-base font-semibold tracking-normal text-foreground">考勤记录</h2>
          {attendanceRecords.map((record) => (
            <ParentAttendanceRecordCard key={record.id} record={record} />
          ))}
        </section>
      ) : null}

      {homeworkReminders.length > 0 ? (
        <section id="homework-status" className="grid gap-3 scroll-mt-4">
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
        <section
          id={homeworkReminders.length > 0 ? undefined : "homework-status"}
          className="grid gap-3 scroll-mt-4"
        >
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
