import Link from "next/link";
import { BookOpenText, Download, KeyRound, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function DashboardHelpPage() {
  await requirePermission("route:admin", {
    nextPath: "/dashboard/help",
    unauthorizedRedirectTo: "/unauthorized",
  });

  return (
    <div className="grid gap-6">
      <PageHeader
        title="帮助文档"
        description="EduOS 常用操作、安装说明、安全规则和排障入口。"
        badge="Manual"
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>PWA 安装</CardTitle>
            </div>
            <CardDescription>所有角色安装同一个 EduOS，登录后按角色进入不同页面。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>浏览器控制安装入口位置。安装后通常可在 Windows 开始菜单搜索 EduOS。</p>
            <p>如果没有桌面图标，可以在开始菜单右键 EduOS，选择固定到任务栏或打开文件位置后创建快捷方式。</p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>账号安全</CardTitle>
            </div>
            <CardDescription>服务端权限才是安全边界，菜单隐藏只是体验优化。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>学生不能访问 Admin、老师端、财务或其他学生数据。</p>
            <p>老师不能访问财务、系统设置、其他老师班级或其他 tenant 数据。</p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>Authenticator</CardTitle>
            </div>
            <CardDescription>高权限账号应绑定 Authenticator 动态验证码。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>绑定入口已经放到“系统设置 → 安全中心 → 绑定 Authenticator”。</p>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/dashboard/settings/security">打开安全中心</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpenText className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>完整手册</CardTitle>
            </div>
            <CardDescription>项目内维护一份可跟随版本更新的中文手册。</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>手册文件：docs/APP_MANUAL.md。后续可把该文档渲染成站内帮助中心。</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
