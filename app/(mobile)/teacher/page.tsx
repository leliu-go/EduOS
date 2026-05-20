import Link from "next/link";
import { BookOpen, ClipboardCheck, FilePenLine, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AttendanceRosterForm } from "@/features/attendance/attendance-roster-form";
import { KnowledgePointWeaknessStats } from "@/features/mistakes/weakness-stats-card";
import { getTeacherClassDashboard } from "@/features/reports/teacher-class-dashboard";
import { TimetableCard } from "@/features/scheduling/timetable-card";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function TeacherHomePage() {
  const currentUser = await requirePermission("route:teacher", {
    nextPath: "/teacher",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const dashboard = await getTeacherClassDashboard(currentUser.tenantId, currentUser.id);
  const metrics = [
    {
      label: "今日课次",
      value: dashboard.todayLessons.length,
      icon: <BookOpen className="size-4 text-primary" aria-hidden="true" />,
    },
    {
      label: "待点名",
      value: dashboard.pendingAttendance.length,
      icon: <ClipboardCheck className="size-4 text-primary" aria-hidden="true" />,
    },
    {
      label: "待批改",
      value: dashboard.pendingCorrections.length,
      icon: <FilePenLine className="size-4 text-primary" aria-hidden="true" />,
    },
    {
      label: "班级薄弱点",
      value: dashboard.classWeakness.length,
      icon: <Target className="size-4 text-primary" aria-hidden="true" />,
    },
  ];

  return (
    <div className="grid gap-4">
      <section className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="shadow-none">
            <CardContent className="grid gap-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                {metric.icon}
              </div>
              <p className="text-2xl font-semibold tracking-normal text-foreground">
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-normal text-foreground">今日课次</h2>
        {dashboard.todayLessons.length > 0 ? (
          dashboard.todayLessons.map((schedule) => (
            <div key={schedule.id} className="grid gap-2">
              <TimetableCard
                title={schedule.lesson?.title ?? schedule.classGroup.name}
                courseName={schedule.classGroup.courseProduct.name}
                startAt={schedule.startAt}
                endAt={schedule.endAt}
                status={schedule.status}
                campusName={schedule.campus.name}
                roomName={schedule.room.name}
                classGroupName={schedule.classGroup.name}
              />
              {schedule.lesson?.id ? (
                <Button asChild variant="outline" size="sm" className="justify-self-start">
                  <Link href={`/teacher/lessons/${schedule.lesson.id}`}>
                    <BookOpen className="size-4" aria-hidden="true" />
                    课次资源
                  </Link>
                </Button>
              ) : null}
            </div>
          ))
        ) : (
          <EmptyState title="今日暂无课次" description="今天没有排课时，这里会保持为空。" />
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-normal text-foreground">待点名课程</h2>
        {dashboard.pendingAttendance.length > 0 ? (
          dashboard.pendingAttendance.map((schedule) => (
            <AttendanceRosterForm key={schedule.id} schedule={schedule} />
          ))
        ) : (
          <EmptyState title="暂无待点名" description="当前没有需要处理的点名课程。" />
        )}
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold tracking-normal text-foreground">待批改作业</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/teacher/homework">
              <FilePenLine className="size-4" aria-hidden="true" />
              去批改
            </Link>
          </Button>
        </div>
        {dashboard.pendingCorrections.length > 0 ? (
          dashboard.pendingCorrections.slice(0, 3).map((submission) => (
            <Card key={submission.id} className="shadow-none">
              <CardContent className="grid gap-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-medium text-foreground">
                      {submission.homework.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {submission.student.name} ·{" "}
                      {submission.homework.lesson?.title ??
                        submission.homework.classGroup?.name ??
                        "个人作业"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    第 {submission.attemptNumber} 次
                  </span>
                </div>
                {submission.contentText ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {submission.contentText}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState title="暂无待批改" description="学生提交作业后，会在这里提醒处理。" />
        )}
      </section>

      <KnowledgePointWeaknessStats title="班级薄弱点" stats={dashboard.classWeakness} />
    </div>
  );
}
