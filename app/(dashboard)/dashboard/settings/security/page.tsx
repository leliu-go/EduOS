import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function DashboardSecuritySettingsPage() {
  await requirePermission("route:admin", {
    nextPath: "/dashboard/settings/security",
    unauthorizedRedirectTo: "/unauthorized",
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">安全中心</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          查看高权限账号安全、MFA 状态、最近登录和审计日志入口。
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>MFA 状态</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>Admin、校长和财务账号可启用或强制 MFA。</p>
            <p>生产 KMS 和真实 TOTP secret 生命周期仍需人工审批。</p>
            <Badge variant="secondary" className="w-fit">
              low-risk interface ready
            </Badge>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>审计日志</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>财务操作、课消冲正、资源权限修改、MFA 修改和关键设置修改必须写审计日志。</p>
            <p>后续将补充筛选、导出和异常登录视图。</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
