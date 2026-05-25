import { ShieldCheck } from "lucide-react";

import { verifyMfaChallengeAction } from "@/features/mfa/actions";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getRoleLandingPath } from "@/lib/auth/landing-path";
import { getMfaEnrollmentStatus } from "@/lib/mfa/mfa-status";
import { roleRequiresMfa } from "@/lib/mfa/mfa-policy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const mfaChallengeErrors: Record<string, string> = {
  missing_config: "服务器缺少 MFA 加密配置，请联系管理员。",
  invalid_token: "验证码不正确，请确认手机时间准确后重试。",
  not_enabled: "当前账号尚未完成 Authenticator 绑定。",
  locked: "验证码错误次数过多，请稍后再试。",
};

type MfaChallengePageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function MfaChallengePage({ searchParams }: MfaChallengePageProps) {
  const params = await searchParams;
  const currentUser = await requireCurrentUser("/mfa");
  const nextPath = params?.next || getRoleLandingPath(currentUser.roleKey);
  const errorMessage = params?.error ? mfaChallengeErrors[params.error] : null;

  if (!roleRequiresMfa(currentUser.roleKey)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>无需 MFA</CardTitle>
            <CardDescription>当前角色无需 Authenticator 验证。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={nextPath}>继续</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const enrollmentStatus = await getMfaEnrollmentStatus({
    tenantId: currentUser.tenantId,
    userId: currentUser.id,
  });

  if (enrollmentStatus !== "verified") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>需要先绑定 Authenticator</CardTitle>
            <CardDescription>Admin 高权限账号必须完成 MFA 绑定后才能进入后台。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={`/mfa/setup?next=${encodeURIComponent(nextPath)}`}>
                去绑定 Authenticator
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>Authenticator 验证</CardTitle>
          <CardDescription>请输入 Microsoft Authenticator 中显示的 6 位动态验证码。</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={verifyMfaChallengeAction} className="grid gap-4">
            {errorMessage ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive"
              >
                {errorMessage}
              </p>
            ) : null}
            <input type="hidden" name="next" value={nextPath} />
            <div className="grid gap-2">
              <Label htmlFor="token">动态验证码</Label>
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
            <Button type="submit" className="w-full">
              验证并继续
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
