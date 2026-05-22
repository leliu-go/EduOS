import Link from "next/link";
import {
  Bell,
  BookOpen,
  FileText,
  HelpCircle,
  LogOut,
  ShieldCheck,
  Trash2,
  UserCircle,
  WalletCards,
} from "lucide-react";

import { ClearEduosCacheButton } from "@/components/install/clear-cache-button";
import { TaskCard } from "@/components/mobile/TaskCard";
import { VersionBadge } from "@/components/version/version-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutAction } from "@/lib/auth/actions";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function StudentMePage() {
  const currentUser = await requirePermission("route:student", {
    nextPath: "/student/me",
  });

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">我的学习账号</CardTitle>
              <CardDescription>个人信息、版本、缓存和帮助入口。</CardDescription>
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
              <p className="truncate text-base font-semibold">{currentUser.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {currentUser.email ?? "未绑定邮箱"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{currentUser.tenantName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-3 sm:grid-cols-2">
        <TaskCard
          href="/student/resources"
          icon={BookOpen}
          title="授权资源"
          description="查看老师开放给你的讲义、题单、单词书和课程资料。"
          status="只读"
          statusTone="info"
        />
        <TaskCard
          href="/student/reports"
          icon={FileText}
          title="学情报告"
          description="查看出勤、作业、错题和阶段学习建议。"
        />
        <TaskCard
          href="/student/payments"
          icon={WalletCards}
          title="课时与缴费"
          description="仅展示自己的课时和缴费记录，不展示机构财务后台。"
        />
        <TaskCard
          href="/student/notifications"
          icon={Bell}
          title="消息提醒"
          description="查看课程、作业、活动和系统通知。"
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>账号安全</CardTitle>
          <CardDescription>学生账号安全策略由机构统一配置。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border bg-muted/30 p-4">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium">登录保护</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              高权限 MFA 由后台配置；学生端不持有任何云资源密钥。
            </p>
          </div>
          <div className="rounded-md border bg-muted/30 p-4">
            <Trash2 className="size-5 text-primary" aria-hidden="true" />
            <div className="mt-3">
              <ClearEduosCacheButton />
            </div>
            <p className="mt-3 text-sm font-medium">本地缓存</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              PWA 只缓存应用外壳和已授权资源。缓存清理按钮会在后续版本接入。
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>帮助与退出</CardTitle>
          <CardDescription>遇到课程、作业或资源问题，请先联系老师或教务。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/student/notifications">
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
