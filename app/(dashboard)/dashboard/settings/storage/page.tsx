import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateProductionEnv } from "@/lib/env/production-env";
import { requirePermission } from "@/lib/rbac/require-permission";

function maskBucketName(value: string | undefined) {
  if (!value) {
    return "未配置";
  }

  if (value.length <= 8) {
    return `${value.slice(0, 2)}***`;
  }

  return `${value.slice(0, 6)}***${value.slice(-4)}`;
}

export default async function DashboardStorageSettingsPage() {
  await requirePermission("route:admin", {
    nextPath: "/dashboard/settings/storage",
    unauthorizedRedirectTo: "/unauthorized",
  });

  const report = validateProductionEnv(process.env);
  const bucketName = process.env.ALIYUN_OSS_BUCKET;
  const signedUrlTtl = process.env.ALIYUN_OSS_SIGNED_URL_TTL_SECONDS ?? "300";

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">存储状态</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          只展示脱敏配置状态，不展示 AccessKeySecret、数据库密码或任何密钥值。
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Storage Provider</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>当前 provider：{report.provider}</p>
            <p>配置状态：{report.ok ? "可用" : "缺少必需环境变量"}</p>
            <Badge variant={report.ok ? "default" : "secondary"} className="w-fit">
              {report.ok ? "ready" : "needs config"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>OSS 私有资源策略</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>Bucket：{maskBucketName(bucketName)}</p>
            <p>signed URL TTL：{signedUrlTtl} 秒</p>
            <p>本地只做轻量缓存，资源下载必须先经过服务端权限校验。</p>
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>脱敏检查</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          <p>AccessKeySecret：不展示</p>
          <p>AccessKeyId：{report.redacted.ALIYUN_OSS_ACCESS_KEY_ID ?? "not required"}</p>
          <p>Endpoint：{report.redacted.ALIYUN_OSS_ENDPOINT ?? "not required"}</p>
          <p>缺失项：{report.missing.length > 0 ? report.missing.join(", ") : "无"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
