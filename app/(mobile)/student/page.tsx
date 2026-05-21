import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  BookOpenText,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  Headphones,
  Library,
  NotebookPen,
  PenLine,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudentCheckInSchedules } from "@/features/attendance/queries";
import { StudentCheckInCard } from "@/features/attendance/student-check-in-card";
import { calculateCourseAccountBalance } from "@/features/course-accounts/balance";
import { CourseConsumptionLedgerCard } from "@/features/course-consumptions/ledger-card";
import { getStudentCourseConsumptionLedger } from "@/features/course-consumptions/queries";
import { getStudentEnrolledCourses } from "@/features/enrollments/queries";
import { getStudentHomeworkReminders } from "@/features/homework/queries";
import { LearningTaskCard } from "@/features/learning/learning-task-card";
import {
  learningTaskTypeHints,
  learningTaskTypeLabels,
  type LearningTaskTypeValue,
} from "@/features/learning/learning-schema";
import { getStudentLearningStats, getStudentLearningTasks } from "@/features/learning/queries";
import { getStudentErrorRecords } from "@/features/mistakes/queries";
import { getStudentVisibleResources } from "@/features/resources/queries";
import { getStudentTimetable } from "@/features/scheduling/portal-queries";
import { TimetableCard } from "@/features/scheduling/timetable-card";
import { requirePermission } from "@/lib/rbac/require-permission";
import { cn } from "@/lib/utils";

type StudentSchedule = Awaited<ReturnType<typeof getStudentTimetable>>[number];
type StudentCheckInSchedule = Awaited<ReturnType<typeof getStudentCheckInSchedules>>[number];
type StudentEnrollment = Awaited<ReturnType<typeof getStudentEnrolledCourses>>[number];
type StudentLearningTask = Awaited<ReturnType<typeof getStudentLearningTasks>>[number];

type StudentHomeCardProps = {
  title: string;
  value: string;
  description: string;
  href?: string;
  icon: typeof CalendarDays;
  className?: string;
};

const learningFocusItems: Array<{
  type: LearningTaskTypeValue;
  label: string;
  icon: typeof PenLine;
}> = [
  { type: "MEMORIZATION", label: "单词打卡", icon: PenLine },
  { type: "READING", label: "每日阅读", icon: BookOpenText },
  { type: "PRACTICE", label: "听力练习", icon: Headphones },
  { type: "SPECIAL_TRAINING", label: "针对练习", icon: Sparkles },
];

function isSameDay(left: Date, right: Date) {
  return left.toISOString().slice(0, 10) === right.toISOString().slice(0, 10);
}

function formatTime(value: Date) {
  return value.toISOString().slice(11, 16);
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getNextLessonDescription(lesson: StudentSchedule | undefined) {
  if (!lesson) {
    return "今天暂无待上课程";
  }

  return `${formatTime(lesson.startAt)} ${lesson.classGroup.courseProduct.name}`;
}

function getCheckInDescription(schedule: StudentCheckInSchedule | undefined) {
  if (!schedule) {
    return "今天暂无待签到课程";
  }

  const pendingCount = schedule.checkIns.length > 0 ? 0 : 1;

  return pendingCount > 0 ? `${formatTime(schedule.startAt)} 前后完成签到` : "今日课程已签到";
}

function getLearningTypeStats(tasks: StudentLearningTask[], type: LearningTaskTypeValue) {
  const items = tasks.filter((task) => task.taskType === type);
  const completed = items.filter((task) => task.checkIns.length > 0).length;

  return {
    total: items.length,
    completed,
  };
}

function StudentHomeCard({
  title,
  value,
  description,
  href,
  icon: Icon,
  className,
}: StudentHomeCardProps) {
  const content = (
    <Card className="h-full">
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          {href ? (
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-semibold tracking-normal text-foreground">{value}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href} className={cn("block h-full", className)}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function LearningFocusCard({
  type,
  label,
  icon: Icon,
  tasks,
}: {
  type: LearningTaskTypeValue;
  label: string;
  icon: typeof PenLine;
  tasks: StudentLearningTask[];
}) {
  const stats = getLearningTypeStats(tasks, type);

  return (
    <div className="rounded-md border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <Badge variant={stats.total > 0 ? "secondary" : "outline"}>
          {stats.completed}/{stats.total}
        </Badge>
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{label}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
        {learningTaskTypeHints[type]}
      </p>
    </div>
  );
}

function StudentEnrollmentCard({ enrollment }: { enrollment: StudentEnrollment }) {
  const balance = calculateCourseAccountBalance(enrollment.courseAccount);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{enrollment.courseProduct.name}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {enrollment.courseProduct.subject.name} · {enrollment.courseProduct.grade.name}
            </p>
          </div>
          <Badge variant="secondary">剩余 {balance.remainingHours} 课时</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <BookOpen className="size-4" aria-hidden="true" />
          {enrollment.classGroup?.name ?? "暂未分班"}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays className="size-4" aria-hidden="true" />
          报名日期：{formatDate(enrollment.enrolledAt)}
        </p>
      </CardContent>
    </Card>
  );
}

export default async function StudentHomePage() {
  const currentUser = await requirePermission("route:student", {
    nextPath: "/student",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const today = new Date();
  const [
    timetable,
    homeworkReminders,
    checkInSchedules,
    mistakeRecords,
    resources,
    enrolledCourses,
    consumptionLedger,
    learningTasks,
    learningStats,
  ] = await Promise.all([
    getStudentTimetable(currentUser.tenantId, currentUser.id, today),
    getStudentHomeworkReminders(currentUser.tenantId, currentUser.id, today),
    getStudentCheckInSchedules(currentUser.tenantId, currentUser.id, today),
    getStudentErrorRecords(currentUser.tenantId, currentUser.id),
    getStudentVisibleResources(currentUser.tenantId, currentUser.id),
    getStudentEnrolledCourses(currentUser.tenantId, currentUser.id),
    getStudentCourseConsumptionLedger(currentUser.tenantId, currentUser.id, { limit: 5 }),
    getStudentLearningTasks(currentUser.tenantId, currentUser.id, today),
    getStudentLearningStats(currentUser.tenantId, currentUser.id, today),
  ]);
  const todayLessons = timetable.filter((schedule) => isSameDay(schedule.startAt, today));
  const pendingCheckIns = checkInSchedules.filter((schedule) => schedule.checkIns.length === 0);
  const nextLesson = todayLessons[0];
  const nextCheckIn = checkInSchedules[0];
  const visibleLessons = todayLessons.length > 0 ? todayLessons : timetable.slice(0, 3);
  const completedLearningTasks = learningTasks.filter((task) => task.checkIns.length > 0).length;
  const hasNoStudentData =
    todayLessons.length === 0 &&
    homeworkReminders.length === 0 &&
    checkInSchedules.length === 0 &&
    mistakeRecords.length === 0 &&
    resources.length === 0 &&
    enrolledCourses.length === 0 &&
    consumptionLedger.length === 0 &&
    learningTasks.length === 0;

  return (
    <div className="grid gap-5">
      <section className="grid grid-cols-2 gap-3">
        <StudentHomeCard
          title="今日课程"
          value={`${todayLessons.length}`}
          description={getNextLessonDescription(nextLesson)}
          icon={CalendarDays}
        />
        <StudentHomeCard
          title="待完成作业"
          value={`${homeworkReminders.length}`}
          description="查看待提交、需订正或即将截止的作业"
          href="/student/homework"
          icon={NotebookPen}
        />
        <StudentHomeCard
          title="签到"
          value={`${pendingCheckIns.length}`}
          description={getCheckInDescription(nextCheckIn)}
          icon={CalendarCheck}
        />
        <StudentHomeCard
          title="错题本"
          value={`${mistakeRecords.length}`}
          description="复盘薄弱知识点和待订正错题"
          href="/student/mistakes"
          icon={AlertTriangle}
        />
        <StudentHomeCard
          title="学习资源"
          value={`${resources.length}`}
          description="查看老师开放的课件、讲义和练习"
          href="/student/resources"
          icon={Library}
          className="col-span-2"
        />
      </section>

      <section className="grid gap-3">
        <Card className="overflow-hidden">
          <CardContent className="grid gap-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant="secondary">今日学习任务</Badge>
                <h2 className="mt-3 text-lg font-semibold tracking-normal text-foreground">
                  {completedLearningTasks}/{learningTasks.length} 已完成
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  连续 {learningStats.currentStreak} 天 · 近 30 天完成率 {learningStats.completionRate}%
                </p>
              </div>
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {learningFocusItems.map((item) => (
                <LearningFocusCard
                  key={item.type}
                  type={item.type}
                  label={item.label}
                  icon={item.icon}
                  tasks={learningTasks}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        {learningTasks.length > 0 ? (
          learningTasks.map((task) => <LearningTaskCard key={task.id} task={task} />)
        ) : (
          <EmptyState
            title="暂无今日学习任务"
            description={`${learningTaskTypeLabels.MEMORIZATION}、${learningTaskTypeLabels.READING}、${learningTaskTypeLabels.PRACTICE} 会在老师布置后显示。`}
          />
        )}
      </section>

      {hasNoStudentData ? (
        <EmptyState title="暂无今日学习安排" description="有新的课程、作业或资源后会显示在这里。" />
      ) : null}

      {checkInSchedules.length > 0 ? (
        <section className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-normal text-foreground">签到</h2>
            <Badge variant="secondary">{pendingCheckIns.length} 个待签</Badge>
          </div>
          {checkInSchedules.slice(0, 2).map((schedule) => (
            <StudentCheckInCard key={schedule.id} schedule={schedule} />
          ))}
        </section>
      ) : null}

      {visibleLessons.length > 0 ? (
        <section className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-normal text-foreground">今日课程</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/student/reports">学习报告</Link>
            </Button>
          </div>
          {visibleLessons.map((schedule) => (
            <div key={schedule.id} className="grid gap-2">
              <TimetableCard
                title={schedule.lesson?.title ?? schedule.classGroup.name}
                courseName={schedule.classGroup.courseProduct.name}
                startAt={schedule.startAt}
                endAt={schedule.endAt}
                status={schedule.status}
                campusName={schedule.campus.name}
                classGroupName={schedule.classGroup.name}
                teacherName={schedule.teacher.name}
              />
              {schedule.lesson?.id ? (
                <Button asChild variant="outline" size="sm" className="justify-self-start">
                  <Link href={`/student/lessons/${schedule.lesson.id}/resources`}>课次资源</Link>
                </Button>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {consumptionLedger.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-base font-semibold tracking-normal text-foreground">课消记录</h2>
          {consumptionLedger.map((item) => (
            <CourseConsumptionLedgerCard key={item.id} item={item} />
          ))}
        </section>
      ) : null}

      {enrolledCourses.map((enrollment) => (
        <StudentEnrollmentCard key={enrollment.id} enrollment={enrollment} />
      ))}
    </div>
  );
}
