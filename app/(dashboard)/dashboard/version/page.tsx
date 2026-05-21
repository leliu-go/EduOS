import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VersionBadge } from "@/components/version/version-badge";
import { requirePermission } from "@/lib/rbac/require-permission";
import { getAppVersion, getUpdateManifest } from "@/lib/version/app-version";

export default async function DashboardVersionPage() {
  await requirePermission("route:admin", {
    nextPath: "/dashboard/version",
    unauthorizedRedirectTo: "/unauthorized",
  });

  const appVersion = getAppVersion();
  const updateManifest = getUpdateManifest();

  return (
    <div className="grid gap-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">版本与更新</h1>
          <VersionBadge />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          查看当前 EduOS 版本、更新 manifest 与发布信息。更新提示不会强制刷新正在操作的用户。
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>当前版本</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>应用：{appVersion.name}</p>
            <p>版本：v{appVersion.version}</p>
            <p>构建：{appVersion.buildId}</p>
            <p>提交：{appVersion.shortCommitHash}</p>
            <p>构建时间：{appVersion.buildTime ?? "本地开发版本"}</p>
            <p>发布时间：{appVersion.releasedAt ?? "本地开发版本"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>更新策略</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>最新版本：v{updateManifest.latestVersion}</p>
            <p>最低支持：v{updateManifest.minimumSupportedVersion}</p>
            <p>强制更新：{updateManifest.forceUpdate ? "是" : "否"}</p>
            <p>更新入口：{updateManifest.updateUrl}</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
