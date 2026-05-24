import { AlertTriangle, Archive, DatabaseBackup, KeyRound } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { validateProductionEnv } from "@/lib/env/production-env";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac/permissions";
import { requirePermission } from "@/lib/rbac/require-permission";
import { normalizeTenantBackupPolicy } from "@/lib/security/backup-policy/tenant-backup-policy";

function maskBucketName(value: string | undefined) {
  if (!value) {
    return "未配置";
  }

  if (value.length <= 8) {
    return `${value.slice(0, 2)}***`;
  }

  return `${value.slice(0, 6)}***${value.slice(-4)}`;
}

function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return "尚未记录";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getDeviceRoleLabel(role: string) {
  const labels: Record<string, string> = {
    LOGIN_ONLY: "普通登录设备",
    BACKUP_AUTHORIZED: "备份授权设备",
    PRIMARY_BACKUP: "主备份设备",
    STANDBY_BACKUP: "备用备份设备",
  };

  return labels[role] ?? role;
}

function getDeviceStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "已启用",
    REVOKED: "已撤销",
    LOST: "已标记丢失",
    REPLACED: "已替换",
  };

  return labels[status] ?? status;
}

export default async function DashboardStorageSettingsPage() {
  const currentUser = await requirePermission("route:admin", {
    nextPath: "/dashboard/settings/storage",
    unauthorizedRedirectTo: "/unauthorized",
  });

  const report = validateProductionEnv(process.env);
  const bucketName = process.env.ALIYUN_OSS_BUCKET;
  const signedUrlTtl = process.env.ALIYUN_OSS_SIGNED_URL_TTL_SECONDS ?? "300";
  const canManageBackup = hasPermission(currentUser.roleKey, "adminBackup:manage");
  const [persistedPolicy, devices] = canManageBackup
    ? await Promise.all([
        prisma.tenantBackupPolicy.findUnique({
          where: {
            tenantId: currentUser.tenantId,
          },
        }),
        prisma.adminBackupDevice.findMany({
          where: {
            tenantId: currentUser.tenantId,
          },
          include: {
            adminUser: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: [{ deviceRole: "desc" }, { updatedAt: "desc" }],
        }),
      ])
    : [null, []];
  const policy = normalizeTenantBackupPolicy(
    persistedPolicy ?? {
      tenantId: currentUser.tenantId,
    },
  );
  const primaryDevice = devices.find(
    (device) => device.deviceRole === "PRIMARY_BACKUP" && device.status === "ACTIVE",
  );

  return (
    <div className="grid gap-6">
      <PageHeader
        title="存储与备份"
        description="OSS 私有资源、signed URL 策略和 Admin 本地加密备份统一在这里查看。页面不展示任何密钥值。"
        badge={report.ok ? "ready" : "needs config"}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Archive className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>Storage Provider</CardTitle>
            </div>
            <CardDescription>文件本体走 provider，数据库只保存元数据。</CardDescription>
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
            <CardDescription>浏览器不能持有 OSS 主密钥或 RAM AccessKey。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>Bucket：{maskBucketName(bucketName)}</p>
            <p>signed URL TTL：{signedUrlTtl} 秒</p>
            <p>资源下载必须先通过服务端 RBAC + tenantId 校验，再生成 signed URL。</p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DatabaseBackup className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>本地加密备份</CardTitle>
            </div>
            <CardDescription>只同步核心结构化数据，不同步大文件。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>PRIMARY_BACKUP：{primaryDevice ? primaryDevice.deviceName : "尚未设置"}</p>
            <p>策略：最多 {policy.maxActiveBackupDevices} 台主备份设备。</p>
            <p>不保存作业照片、错题照片、视频、附件、signed URL、token、密码哈希或 MFA secret。</p>
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>脱敏配置检查</CardTitle>
          <CardDescription>这里只展示脱敏状态，不读取或打印真实密钥。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          <p>AccessKeySecret：不展示</p>
          <p>AccessKeyId：{report.redacted.ALIYUN_OSS_ACCESS_KEY_ID ?? "not required"}</p>
          <p>Endpoint：{report.redacted.ALIYUN_OSS_ENDPOINT ?? "not required"}</p>
          <p>缺失项：{report.missing.length > 0 ? report.missing.join(", ") : "无"}</p>
        </CardContent>
      </Card>

      {canManageBackup ? (
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <KeyRound className="size-5 text-primary" aria-hidden="true" />
                  <CardTitle>Admin 备份设备</CardTitle>
                </div>
                <CardDescription>
                  Admin 可多设备登录，但只有 active PRIMARY_BACKUP 设备可同步核心备份。
                </CardDescription>
              </div>
              <Badge variant={primaryDevice ? "default" : "secondary"}>
                {primaryDevice ? "PRIMARY_BACKUP active" : "needs backup device"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {devices.length > 0 ? (
              devices.map((device) => (
                <div
                  key={device.id}
                  className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1.4fr_1fr_1fr]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-medium">{device.deviceName}</h2>
                      <Badge
                        variant={device.deviceRole === "PRIMARY_BACKUP" ? "default" : "secondary"}
                      >
                        {getDeviceRoleLabel(device.deviceRole)}
                      </Badge>
                      <Badge variant={device.status === "ACTIVE" ? "outline" : "destructive"}>
                        {getDeviceStatusLabel(device.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      指纹：{device.publicKeyFingerprint}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>持有人：{device.adminUser.name}</p>
                    <p>{device.adminUser.email ?? "未设置邮箱"}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>最近登录：{formatDateTime(device.lastSeenAt)}</p>
                    <p>最近同步：{formatDateTime(device.lastSyncAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                尚未注册备份设备。Admin 仍可多设备登录，但没有 PRIMARY_BACKUP 设备时不会同步本地备份。
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-amber-50 shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-700" aria-hidden="true" />
              <CardTitle className="text-amber-950">备份设备权限</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-amber-900">
            当前角色可查看存储状态，但不能管理 Admin 本地备份设备。
          </CardContent>
        </Card>
      )}
    </div>
  );
}
