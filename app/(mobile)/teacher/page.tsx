import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  FilePenLine,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/mobile/SectionHeader";
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
      label: "今日课程",
      value: dashboard.todayLessons.length,
      description: "今日课次安排",
      href: "#today-lessons",
      icon: <BookOpen className="size-4 text-primary" aria-hidden="true" />,
    },
    {
      label: "待点名",
      value: dashboard.pendingAttendance.length,
      description: "课前课后快速点名",
      href: "#pending-attendance",
      icon: <ClipboardCheck className="size-4 text-primary" aria-hidden="true" />,
    },
    {
      label: "待批改",
      value: dashboard.pendingCorrections.length,
      description: "进入作业批改台",
      href: "/teacher/homework",
      icon: <FilePenLine className="size-4 text-primary" aria-hidden="true" />,
    },
    {
      label: "需关注学生",
      value: dashboard.attentionStudents.length,
      description: "查看错题和订正跟进",
      href: "/teacher/classes",
      icon: <AlertTriangle className="size-4 text-primary" aria-hidden="true" />,
    },
  ];
  const nextLesson = dashboard.todayLessons[0];
  const primaryAction =
    dashboard.pendingAttendance.length > 0
      ? {
          title: "先完成待点名课程",
          description: "点名会同步更新学生端考勤状态，并为后续课消确认提供依据。",
          href: "#pending-attendance",
          label: "去点名",
          icon: <ClipboardCheck className="size-5" aria-hidden="true" />,
        }
      : dashboard.pendingCorrections.length > 0
        ? {
            title: "处理待批改作业",
            description: "批改、点评和订正要求会回到学生端作业流程。",
            href: "/teacher/homework",
            label: "去批改",
            icon: <FilePenLine className="size-5" aria-hidden="true" />,
          }
        : nextLesson?.lesson?.id
          ? {
              title: "准备下一节课",
              description: `${nextLesson.classGroup.name} · ${nextLesson.lesson.title}`,
              href: `/teacher/lessons/${nextLesson.lesson.id}`,
              label: "上课页",
              icon: <BookOpen className="size-5" aria-hidden="true" />,
            }
          : {
              title: "今天暂无紧急事项",
              description: "可以查看课表、班级学生或活动进度，提前准备课堂材料。",
              href: "/teacher/schedule",
              label: "看课表",
              icon: <Target className="size-5" aria-hidden="true" />,
            };

  return (
    <div className="grid gap-4">
      <section className="rounded-md border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              {primaryAction.icon}
            </span>
            <div className="min-w-0">
              <Badge variant="secondary">教学优先</Badge>
              <h2 className="mt-2 text-lg font-semibold tracking-normal text-foreground">
                {primaryAction.title}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {primaryAction.description}
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href={primaryAction.href}>
              {primaryAction.label}
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => {
          const card = (
            <Card className="h-full shadow-none">
              <CardContent className="grid gap-2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <span className="flex items-center gap-2">
                    {metric.icon}
                    <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </span>
                </div>
                <p className="text-2xl font-semibold tracking-normal text-foreground">
                  {metric.value}
                </p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          );

          return (
            <Link key={metric.label} href={metric.href} className="block h-full">
              {card}
            </Link>
          );
        })}
      </section>

      <section id="today-lessons" className="grid gap-3 scroll-mt-4">
        <SectionHeader
          title="今日课程"
          description="只展示你本人授课或授权班级的课程。"
          badge={`${dashboard.todayLessons.length} 节`}
        />
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

      <section id="pending-attendance" className="grid gap-3 scroll-mt-4">
        <SectionHeader
          title="待点名课程"
          description="点名入口放在课程卡片下方，避免老师在多个表格之间来回找。"
          badge={`${dashboard.pendingAttendance.length} 节`}
        />
        {dashboard.pendingAttendance.length > 0 ? (
          dashboard.pendingAttendance.map((schedule) => (
            <AttendanceRosterForm key={schedule.id} schedule={schedule} />
          ))
        ) : (
          <EmptyState title="暂无待点名" description="当前没有需要处理的点名课程。" />
        )}
      </section>

      <section className="grid gap-3">
        <SectionHeader
          title="需关注学生"
          description="优先跟进错题订正、掌握异常和学习风险。"
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/teacher/classes">
                <Target className="size-4" aria-hidden="true" />
                班级详情
              </Link>
            </Button>
          }
        />
        {dashboard.attentionStudents.length > 0 ? (
          dashboard.attentionStudents.map((student) => (
            <Card key={student.id} className="shadow-none">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-medium text-foreground">{student.name}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {student.grade}
                    {student.school ? ` · ${student.school}` : ""}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {student.attentionCount} 条待跟进
                </Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            title="暂无需重点关注学生"
            description="错题订正或掌握情况异常时会在这里提醒。"
          />
        )}
      </section>

      <section className="grid gap-3">
        <SectionHeader
          title="待批改作业"
          description="批改结果会同步给学生，需订正的作业会进入学生端提醒。"
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/teacher/homework">
                <FilePenLine className="size-4" aria-hidden="true" />
                去批改
              </Link>
            </Button>
          }
        />
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
