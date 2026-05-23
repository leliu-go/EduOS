import { AlertTriangle, DatabaseBackup, KeyRound, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";
import { normalizeTenantBackupPolicy } from "@/lib/security/backup-policy/tenant-backup-policy";

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

export default async function BackupDevicesSettingsPage() {
  const currentUser = await requirePermission("adminBackup:manage", {
    nextPath: "/dashboard/settings/backup-devices",
    unauthorizedRedirectTo: "/unauthorized",
  });

  const [persistedPolicy, devices] = await Promise.all([
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
        revokedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ deviceRole: "desc" }, { updatedAt: "desc" }],
    }),
  ]);

  const policy = normalizeTenantBackupPolicy(
    persistedPolicy ?? {
      tenantId: currentUser.tenantId,
    },
  );
  const primaryDevice = devices.find(
    (device) => device.deviceRole === "PRIMARY_BACKUP" && device.status === "ACTIVE",
  );
  const currentUserDevices = devices.filter((device) => device.adminUserId === currentUser.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Admin 本地备份"
        description="管理多 Admin 登录设备、主备份设备和本地核心结构化数据加密备份。"
        badge="PRIMARY_BACKUP only"
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>MFA 与账号安全</CardTitle>
            </div>
            <CardDescription>Authenticator 绑定的是 Admin 用户，不是电脑。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>Admin 在任何电脑登录都必须完成账号密码 + MFA。</p>
            <p>绑定、提升、撤销、同步和导出备份都需要 MFA step-up。</p>
            <Button variant="outline" disabled>
              绑定/重新绑定 Authenticator
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>备份设备策略</CardTitle>
            </div>
            <CardDescription>不使用 MAC 地址，而使用设备密钥绑定。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>只允许 active PRIMARY_BACKUP 设备同步核心数据。</p>
            <p>其他电脑可以登录 Admin，但不能同步备份。</p>
            <p>当前策略：最多 {policy.maxActiveBackupDevices} 台主备份设备。</p>
            <p>自动同步间隔：{policy.minSyncIntervalMinutes} 分钟。</p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DatabaseBackup className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>本地核心数据备份</CardTitle>
            </div>
            <CardDescription>只保存核心结构化数据，不保存大文件。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>本地备份只保存核心结构化数据，不保存作业照片、错题照片、视频和附件。</p>
            <p>备份文件必须加密保存，恢复时需要本地备份密码/恢复密钥。</p>
            <div className="grid grid-cols-2 gap-2">
              <Button disabled>立即同步</Button>
              <Button variant="outline" disabled>
                导出加密备份
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-none">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>备份设备列表</CardTitle>
              <CardDescription>
                只有主备份设备可以同步；电脑丢失后请立即撤销该设备。
              </CardDescription>
            </div>
            <Button disabled>注册当前设备</Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {devices.length > 0 ? (
            devices.map((device) => (
              <div
                key={device.id}
                className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1.4fr_1fr_1fr_auto]"
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
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Button size="sm" variant="outline" disabled>
                    提升为主备份
                  </Button>
                  <Button size="sm" variant="outline" disabled>
                    标记丢失
                  </Button>
                  <Button size="sm" variant="destructive" disabled>
                    撤销
                  </Button>
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

      <Card className="border-amber-200 bg-amber-50 shadow-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-700" aria-hidden="true" />
            <CardTitle className="text-amber-950">当前安全边界</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-amber-900">
          <p>当前账号已登记设备：{currentUserDevices.length} 台。</p>
          <p>
            当前租户主备份设备：
            {primaryDevice
              ? `${primaryDevice.deviceName}（${primaryDevice.publicKeyFingerprint}）`
              : "尚未设置"}
          </p>
          <p>
            服务端同步接口必须同时验证 Admin session、MFA completed、active PRIMARY_BACKUP device、device private key signature 和 tenantId。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
