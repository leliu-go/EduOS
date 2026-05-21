import Link from "next/link";
import {
  Bell,
  BookOpen,
  CalendarDays,
  HelpCircle,
  LogOut,
  NotebookPen,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import { TaskCard } from "@/components/mobile/TaskCard";
import { StatusBadge } from "@/components/mobile/StatusBadge";
import { VersionBadge } from "@/components/version/version-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeacherProfileForUser } from "@/features/teachers/queries";
import { logoutAction } from "@/lib/auth/actions";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function TeacherMePage() {
  const currentUser = await requirePermission("route:teacher", {
    nextPath: "/teacher/me",
  });
  const teacher = await getTeacherProfileForUser(currentUser.tenantId, currentUser.id);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">我的教师账号</CardTitle>
              <CardDescription>教学资料、账号安全、版本和帮助入口。</CardDescription>
            </div>
            <VersionBadge />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary">
              <UserCircle className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{teacher?.name ?? currentUser.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {teacher?.email ?? currentUser.email ?? "未绑定邮箱"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge tone={teacher ? "success" : "warning"}>
                  {teacher ? "教师档案已绑定" : "教师档案待绑定"}
                </StatusBadge>
                <StatusBadge tone="info">{currentUser.tenantName}</StatusBadge>
              </div>
            </div>
          </div>
          {teacher ? (
            <div className="grid gap-3 rounded-md border bg-muted/30 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="font-medium">授课科目</p>
                <p className="mt-1 text-muted-foreground">
                  {teacher.subjects.length ? teacher.subjects.join("、") : "暂未配置"}
                </p>
              </div>
              <div>
                <p className="font-medium">授课年级</p>
                <p className="mt-1 text-muted-foreground">
                  {teacher.grades.length ? teacher.grades.join("、") : "暂未配置"}
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-3 sm:grid-cols-2">
        <TaskCard
          href="/teacher/schedule"
          icon={CalendarDays}
          title="我的课表"
          description="查看今天和本周需要执行的课程。"
        />
        <TaskCard
          href="/teacher/homework"
          icon={NotebookPen}
          title="作业与批改"
          description="布置作业、查看提交、批改和要求订正。"
          status="教学"
          statusTone="info"
        />
        <TaskCard
          href="/teacher/resources"
          icon={BookOpen}
          title="教学资源"
          description="上传和发布自己授权范围内的课程资料。"
        />
        <TaskCard
          href="/teacher/notifications"
          icon={Bell}
          title="消息提醒"
          description="查看课程、作业、资源和活动通知。"
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>安全与边界</CardTitle>
          <CardDescription>老师端只展示本人课程、授权班级和教学执行数据。</CardDescription>
        </CardHeader>
        <CardContent className="rounded-md border bg-muted/30 p-4">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium">权限说明</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            老师端不能进入财务后台、系统设置、全机构经营分析，也不能查看非本人班级和非授权学生。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>帮助与退出</CardTitle>
          <CardDescription>教学资源、排课或作业问题可联系教务处理。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/teacher/notifications">
              <HelpCircle className="size-4" aria-hidden="true" />
              查看帮助通知
            </Link>
          </Button>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
              <LogOut className="size-4" aria-hidden="true" />
              退出登录
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
