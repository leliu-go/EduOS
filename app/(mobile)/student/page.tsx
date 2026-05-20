import Link from "next/link";
import { BookOpen, CalendarDays } from "lucide-react";

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
import { LearningTaskCard } from "@/features/learning/learning-task-card";
import { getStudentLearningStats, getStudentLearningTasks } from "@/features/learning/queries";
import { getStudentTimetable } from "@/features/scheduling/portal-queries";
import { TimetableCard } from "@/features/scheduling/timetable-card";
import { requirePermission } from "@/lib/rbac/require-permission";

type StudentEnrollment = Awaited<ReturnType<typeof getStudentEnrolledCourses>>[number];

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
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
  const [
    enrolledCourses,
    timetable,
    checkInSchedules,
    consumptionLedger,
    learningTasks,
    learningStats,
  ] = await Promise.all([
    getStudentEnrolledCourses(currentUser.tenantId, currentUser.id),
    getStudentTimetable(currentUser.tenantId, currentUser.id),
    getStudentCheckInSchedules(currentUser.tenantId, currentUser.id),
    getStudentCourseConsumptionLedger(currentUser.tenantId, currentUser.id, { limit: 5 }),
    getStudentLearningTasks(currentUser.tenantId, currentUser.id),
    getStudentLearningStats(currentUser.tenantId, currentUser.id),
  ]);

  if (
    enrolledCourses.length === 0 &&
    timetable.length === 0 &&
    checkInSchedules.length === 0 &&
    consumptionLedger.length === 0 &&
    learningTasks.length === 0
  ) {
    return <EmptyState title="暂无已报名课程" description="报名完成后，可在这里查看自己的课程。" />;
  }

  return (
    <div className="grid gap-4">
      {checkInSchedules.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-base font-semibold tracking-normal text-foreground">今日签到</h2>
          {checkInSchedules.map((schedule) => (
            <StudentCheckInCard key={schedule.id} schedule={schedule} />
          ))}
        </section>
      ) : null}

      {learningTasks.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-base font-semibold tracking-normal text-foreground">今日学习打卡</h2>
          <Card>
            <CardContent className="grid grid-cols-2 gap-3 p-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">连续完成</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {learningStats.currentStreak} 天
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">近 30 天完成率</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {learningStats.completionRate}%
                </p>
              </div>
            </CardContent>
          </Card>
          {learningTasks.map((task) => (
            <LearningTaskCard key={task.id} task={task} />
          ))}
        </section>
      ) : null}

      {timetable.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-base font-semibold tracking-normal text-foreground">近期课表</h2>
          {timetable.map((schedule) => (
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
