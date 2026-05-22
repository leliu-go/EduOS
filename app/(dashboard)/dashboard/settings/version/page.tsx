import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VersionBadge } from "@/components/version/version-badge";
import { VersionUpdatePanel } from "@/components/version/version-update-panel";
import { requirePermission } from "@/lib/rbac/require-permission";
import { getAppVersion, getUpdateManifest } from "@/lib/version/app-version";

export default async function DashboardSettingsVersionPage() {
  await requirePermission("route:admin", {
    nextPath: "/dashboard/settings/version",
    unauthorizedRedirectTo: "/unauthorized",
  });

  const appVersion = getAppVersion();
  const updateManifest = getUpdateManifest();

  return (
    <div className="grid gap-6">
      <PageHeader
        title="版本与更新"
        description="查看当前版本、build time、short commit hash 和更新 manifest。这里不展示敏感环境变量。"
        actions={<VersionBadge />}
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>当前版本</CardTitle>
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
            <CardTitle>更新策略</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>最新版本：v{updateManifest.latestVersion}</p>
            <p>最低支持：v{updateManifest.minimumSupportedVersion}</p>
            <p>强制更新：{updateManifest.forceUpdate ? "是" : "否"}</p>
            <p>更新入口：{updateManifest.updateUrl}</p>
            <p>版本记录：{updateManifest.changelogUrl}</p>
          </CardContent>
        </Card>
      </section>

      <VersionUpdatePanel currentVersion={appVersion.version} />
    </div>
  );
}
