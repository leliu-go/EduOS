import QRCode from "qrcode";
import Image from "next/image";
import { KeyRound } from "lucide-react";

import {
  startMfaEnrollmentAction,
  verifyMfaEnrollmentAction,
} from "@/features/mfa/actions";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getRoleLandingPath } from "@/lib/auth/landing-path";
import {
  createLocalDevMfaEncryptionProviderFromEnv,
  parseEncryptedMfaSecret,
} from "@/lib/mfa/mfa-crypto";
import { createTotpProvisioningUri } from "@/lib/mfa/totp";
import { getMfaSecretPersistenceReadiness } from "@/lib/mfa/totp-placeholders";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const setupErrors: Record<string, string> = {
  missing_config: "服务器缺少 MFA 加密配置，暂不能生成二维码。",
  already_enabled: "当前账号已经绑定 Authenticator。",
  not_started: "请先生成二维码，再输入验证码完成绑定。",
  locked: "验证码错误次数过多，请稍后再试。",
  invalid_token: "验证码不正确，请确认手机时间准确后重试。",
};

type MfaSetupPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function MfaSetupPage({ searchParams }: MfaSetupPageProps) {
  const params = await searchParams;
  const currentUser = await requireCurrentUser("/mfa/setup");

  if (!hasPermission(currentUser.roleKey, "security:mfa:manage")) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>无权限</CardTitle>
            <CardDescription>当前账号不能管理 Authenticator。</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

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
    },
  });
  const readiness = getMfaSecretPersistenceReadiness(process.env);
  const encryptionProvider = createLocalDevMfaEncryptionProviderFromEnv(process.env);
  const nextPath = params?.next || getRoleLandingPath(currentUser.roleKey);
  const accountName = currentUser.email ?? currentUser.name;
  const errorMessage = params?.error ? setupErrors[params.error] : null;
  let qrCodeDataUrl: string | null = null;

  if (
    credential?.status === "PENDING_VERIFICATION" &&
    readiness.canPersistSecrets &&
    encryptionProvider
  ) {
    const secret = await encryptionProvider.decrypt(
      parseEncryptedMfaSecret(credential.encryptedTotpSecret),
    );
    const provisioningUri = createTotpProvisioningUri({
      issuer: process.env.MFA_TOTP_ISSUER || "EduOS",
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
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>绑定 Microsoft Authenticator</CardTitle>
          <CardDescription>
            Admin 高权限账号必须先绑定 MFA。二维码只用于当前账号，请不要截图转发。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {errorMessage ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive"
            >
              {errorMessage}
            </p>
          ) : null}

          {!readiness.canPersistSecrets ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              服务器缺少 MFA_TOTP_SECRET_ENCRYPTION_KEY 或 MFA_BACKUP_CODE_PEPPER。补齐后才能生成二维码。
            </div>
          ) : credential?.status === "VERIFIED" ? (
            <div className="grid gap-3">
              <p className="text-sm text-muted-foreground">当前账号已绑定 Authenticator。</p>
              <Button asChild className="w-fit">
                <a href={nextPath}>继续进入系统</a>
              </Button>
            </div>
          ) : qrCodeDataUrl ? (
            <div className="grid gap-5 md:grid-cols-[240px_1fr]">
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
                <input type="hidden" name="returnTo" value="/mfa/setup" />
                <div className="grid gap-2">
                  <Label htmlFor="token">输入 6 位验证码</Label>
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
              <input type="hidden" name="returnTo" value="/mfa/setup" />
              <p className="text-sm text-muted-foreground">
                点击后生成二维码，用 Microsoft Authenticator 扫码后输入动态验证码。
              </p>
              <Button type="submit" className="w-fit">
                生成绑定二维码
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
