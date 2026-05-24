import Link from "next/link";
import { KeyRound, ListChecks, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function DashboardSecuritySettingsPage() {
  await requirePermission("route:admin", {
    nextPath: "/dashboard/settings/security",
    unauthorizedRedirectTo: "/unauthorized",
  });

  return (
    <div className="grid gap-6">
      <PageHeader
        title="安全中心"
        description="账号安全、Authenticator 多因素认证、审计日志和高权限操作统一放在这里。"
        badge="Admin security"
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>MFA 策略</CardTitle>
            </div>
            <CardDescription>Admin、校长和财务账号应启用 Authenticator。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>EduOS 的高权限账号应使用账号密码 + Authenticator 动态验证码。</p>
            <p>真实 TOTP secret 不会显示在页面或日志中，绑定流程必须写审计日志。</p>
            <Badge variant="secondary" className="w-fit">
              SUPER_ADMIN 强制 MFA
            </Badge>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>Authenticator</CardTitle>
            </div>
            <CardDescription>绑定、查看状态和恢复说明都在安全中心处理。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>点击进入绑定说明和服务器配置检查。若生产密钥未配置，页面会明确提示，不会生成或泄露 secret。</p>
            <Button asChild className="w-fit">
              <Link href="/dashboard/settings/security/mfa">绑定 Authenticator</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ListChecks className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>审计日志</CardTitle>
            </div>
            <CardDescription>关键安全与财务操作必须可追溯。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>账号禁用/启用、MFA 修改、备份设备变更、资源权限、财务和课消操作都会写审计日志。</p>
            <p>后续可补充筛选、导出和异常登录视图。</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
