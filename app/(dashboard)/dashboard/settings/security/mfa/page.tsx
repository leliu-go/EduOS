import { AlertTriangle, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";

import {
  startMfaEnrollmentAction,
  verifyMfaEnrollmentAction,
} from "@/features/mfa/actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createLocalDevMfaEncryptionProviderFromEnv,
  parseEncryptedMfaSecret,
} from "@/lib/mfa/mfa-crypto";
import { createTotpProvisioningUri } from "@/lib/mfa/totp";
import { getMfaSecretPersistenceReadiness } from "@/lib/mfa/totp-placeholders";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

const mfaMessages: Record<string, string> = {
  missing_config: "服务器缺少 MFA 加密配置，暂不能生成二维码。",
  already_enabled: "当前账号已经绑定 Authenticator。",
  not_started: "请先生成二维码，再输入验证码完成绑定。",
  locked: "验证码错误次数过多，请稍后再试。",
  invalid_token: "验证码不正确，请确认手机时间准确后重试。",
};

function formatMfaStatus(status: string | null | undefined) {
  const labels: Record<string, string> = {
    PENDING_VERIFICATION: "待验证",
    VERIFIED: "已绑定",
    LOCKED: "已锁定",
    DISABLED: "已停用",
  };

  return status ? labels[status] ?? status : "未绑定";
}

type DashboardMfaSettingsPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function DashboardMfaSettingsPage({
  searchParams,
}: DashboardMfaSettingsPageProps) {
  const params = await searchParams;
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
      encryptedTotpSecret: true,
      lastVerifiedAt: true,
      lockedUntil: true,
    },
  });
  const readiness = getMfaSecretPersistenceReadiness(process.env);
  const encryptionProvider = createLocalDevMfaEncryptionProviderFromEnv(process.env);
  const issuer = process.env.MFA_TOTP_ISSUER || "EduOS";
  const accountName = currentUser.email ?? currentUser.name;
  const nextPath = params?.next || "/dashboard";
  const errorMessage = params?.error ? mfaMessages[params.error] : null;
  let qrCodeDataUrl: string | null = null;

  if (
    credential?.status === "PENDING_VERIFICATION" &&
    encryptionProvider &&
    readiness.canPersistSecrets
  ) {
    const secret = await encryptionProvider.decrypt(
      parseEncryptedMfaSecret(credential.encryptedTotpSecret),
    );
    const provisioningUri = createTotpProvisioningUri({
      issuer,
      accountName,
      secret,
    });
    qrCodeDataUrl = await QRCode.toDataURL(provisioningUri, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
    });
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="绑定 Authenticator"
        description="推荐使用 Microsoft Authenticator 扫描二维码，完成 Admin 高权限登录保护。"
        badge="TOTP"
      />

      {errorMessage ? (
        <div role="alert" className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

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
            <p>账号：{accountName}</p>
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
                    <p className="mt-1">可以生成二维码，并使用 Microsoft Authenticator 扫码绑定。</p>
                  </div>
                </div>
              </div>
            )}

            <p>
              绑定流程：生成二维码，打开 Microsoft Authenticator，选择添加账号并扫描二维码，然后输入 6 位验证码完成验证。
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Microsoft Authenticator 绑定流程</CardTitle>
          <CardDescription>二维码只用于当前账号。请不要截图转发给其他人。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {credential?.status === "VERIFIED" ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              当前账号已绑定 Authenticator。下次登录高权限后台时，需要输入手机上的 6 位动态验证码。
            </div>
          ) : qrCodeDataUrl ? (
            <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
              <div className="rounded-lg border border-border bg-background p-4">
                <Image
                  src={qrCodeDataUrl}
                  alt="Microsoft Authenticator 绑定二维码"
                  width={224}
                  height={224}
                  unoptimized
                  className="mx-auto"
                />
              </div>
              <form action={verifyMfaEnrollmentAction} className="grid content-start gap-4">
                <input type="hidden" name="next" value={nextPath} />
                <input type="hidden" name="returnTo" value="/dashboard/settings/security/mfa" />
                <div className="grid gap-2">
                  <Label htmlFor="token">输入 Microsoft Authenticator 中的 6 位验证码</Label>
                  <Input
                    id="token"
                    name="token"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="123456"
                    required
                  />
                </div>
                <Button type="submit" className="w-fit">
                  完成绑定
                </Button>
              </form>
            </div>
          ) : (
            <form action={startMfaEnrollmentAction} className="grid gap-3">
              <input type="hidden" name="next" value={nextPath} />
              <input type="hidden" name="returnTo" value="/dashboard/settings/security/mfa" />
              <p className="text-sm text-muted-foreground">
                点击后会生成一个新的 TOTP 二维码，并把 secret 加密保存为待验证状态。
              </p>
              <Button type="submit" className="w-fit" disabled={!readiness.canPersistSecrets}>
                生成绑定二维码
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
