import { AlertTriangle, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getMfaSecretPersistenceReadiness } from "@/lib/mfa/totp-placeholders";
import { requirePermission } from "@/lib/rbac/require-permission";

function formatMfaStatus(status: string | null | undefined) {
  const labels: Record<string, string> = {
    PENDING_VERIFICATION: "待验证",
    VERIFIED: "已绑定",
    LOCKED: "已锁定",
    DISABLED: "已停用",
  };

  return status ? labels[status] ?? status : "未绑定";
}

export default async function DashboardMfaSettingsPage() {
  const currentUser = await requirePermission("security:mfa:manage", {
    nextPath: "/dashboard/settings/security/mfa",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const credential = await prisma.userMfaCredential.findUnique({
    where: {
      tenantId_userId_provider: {
        tenantId: currentUser.tenantId,
        userId: currentUser.id,
        provider: "totp",
      },
    },
    select: {
      status: true,
      lastVerifiedAt: true,
      lockedUntil: true,
    },
  });
  const readiness = getMfaSecretPersistenceReadiness(process.env);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="绑定 Authenticator"
        description="Admin 的 MFA 属于账号安全，不属于本地备份设备。这里显示绑定状态和安全配置检查。"
        badge="TOTP"
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>当前账号 MFA 状态</CardTitle>
            </div>
            <CardDescription>只展示状态，不展示 TOTP secret、恢复码或密钥材料。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>账号：{currentUser.email ?? currentUser.name}</p>
            <p>状态：{formatMfaStatus(credential?.status)}</p>
            <p>
              最近验证：
              {credential?.lastVerifiedAt
                ? credential.lastVerifiedAt.toISOString().slice(0, 16).replace("T", " ")
                : "暂无记录"}
            </p>
            <Badge variant={credential?.status === "VERIFIED" ? "default" : "secondary"} className="w-fit">
              {credential?.status === "VERIFIED" ? "已启用" : "需要绑定"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>绑定前检查</CardTitle>
            </div>
            <CardDescription>生产环境必须先准备加密密钥和恢复码 pepper。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            {readiness.missingEnvironment.length > 0 ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium">暂不能生成 Authenticator 二维码</p>
                    <p className="mt-1">
                      服务器缺少 MFA 加密配置。EduOS 不会在配置不完整时生成或保存 TOTP secret。
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium">MFA 加密配置已存在</p>
                    <p className="mt-1">下一步可接入二维码生成和首次验证码确认流程。</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="font-medium text-foreground">需要的服务器变量</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>MFA_ENCRYPTION_KEY_ID</li>
                <li>MFA_TOTP_SECRET_ENCRYPTION_KEY</li>
                <li>MFA_BACKUP_CODE_PEPPER</li>
              </ul>
            </div>
            <p>
              绑定流程原则：生成二维码后由 Admin 使用 Authenticator 扫描，并输入 6 位验证码完成验证；恢复码只显示一次且只保存哈希。
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
