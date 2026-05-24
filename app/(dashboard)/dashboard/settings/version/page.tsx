import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VersionBadge } from "@/components/version/version-badge";
import { requirePermission } from "@/lib/rbac/require-permission";
import { getAppVersion } from "@/lib/version/app-version";

export default async function DashboardSettingsVersionPage() {
  await requirePermission("route:admin", {
    nextPath: "/dashboard/settings/version",
    unauthorizedRedirectTo: "/unauthorized",
  });

  const appVersion = getAppVersion();

  return (
    <div className="grid gap-6">
      <PageHeader
        title="版本信息"
        description="EduOS 由服务器统一部署。服务器更新后，所有用户重新打开或刷新页面即可使用新版本。"
        actions={<VersionBadge />}
      />

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>当前部署版本</CardTitle>
          <CardDescription>这里不展示敏感环境变量、数据库地址、OSS 密钥或服务器密钥。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          <p>应用：{appVersion.name}</p>
          <p>版本：v{appVersion.version}</p>
          <p>构建：{appVersion.buildId}</p>
          <p>short commit hash：{appVersion.shortCommitHash}</p>
          <p>build time：{appVersion.buildTime ?? "本地开发版本"}</p>
          <p>发布时间：{appVersion.releasedAt ?? "本地开发版本"}</p>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>更新说明</CardTitle>
          <CardDescription>当前阶段 EduOS 的发布由管理员在服务器执行 git pull / build / PM2 restart。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          <p>用户端不需要下载独立安装包更新，也不需要在浏览器里手动拉取代码。</p>
          <p>PWA 安装版本质是同一个云端入口；服务器部署完成后，用户刷新即可加载最新前端。</p>
          <p>如页面长时间停留在旧版本，可让用户关闭 EduOS 窗口后重新打开。</p>
        </CardContent>
      </Card>
    </div>
  );
}
