import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/auth/actions";

const loginErrors = {
  invalid_input: "请输入有效账号和密码。",
  invalid_credentials: "账号或密码错误。",
  missing_context: "账号尚未绑定机构角色。",
} as const;

type LoginPageProps = {
  searchParams?: Promise<{
    error?: keyof typeof loginErrors;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = params?.error ? loginErrors[params.error] : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1>登录 EduOS</h1>
          </CardTitle>
          <CardDescription>使用机构账号进入系统。</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="grid gap-4">
            {errorMessage ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive"
              >
                {errorMessage}
              </p>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="email">账号</Label>
              <Input
                id="email"
                name="email"
                placeholder="请输入账号"
                type="email"
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                placeholder="请输入密码"
                type="password"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full">
              登录
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
