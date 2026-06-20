import Link from "next/link";
import {
  BookOpenText,
  Building2,
  CreditCard,
  DatabaseBackup,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordChangeForm } from "@/features/accounts/password-change-form";
import { requirePermission } from "@/lib/rbac/require-permission";

const settingsItems = [
  {
    title: "机构信息",
    description: "维护校区、教室和机构基础资料。",
    href: "/dashboard/campuses",
    icon: Building2,
  },
  {
    title: "安全中心",
    description: "管理 MFA、账号安全、审计日志和高权限操作说明。",
    href: "/dashboard/settings/security",
    icon: ShieldCheck,
  },
  {
    title: "存储与备份",
    description: "查看 OSS 存储状态、资源安全策略和 Admin 本地加密备份。",
    href: "/dashboard/settings/storage",
    icon: DatabaseBackup,
  },
  {
    title: "版本信息",
    description: "查看当前服务器部署版本、构建时间和提交号。",
    href: "/dashboard/settings/version",
    icon: Sparkles,
  },
  {
    title: "财务设置",
    description: "人工收款方式、对账规则和后续支付 provider 方案。",
    href: "/dashboard/payments",
    icon: CreditCard,
  },
  {
    title: "帮助文档",
    description: "查看 EduOS 使用手册、安装说明和常见问题。",
    href: "/dashboard/help",
    icon: BookOpenText,
  },
];

type DashboardSettingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardSettingsPage({ searchParams }: DashboardSettingsPageProps) {
  await requirePermission("route:admin", {
    nextPath: "/dashboard/settings",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const passwordMessage =
    params.password === "changed"
      ? "密码已更新。"
      : params.password === "invalid_current"
        ? "当前密码不正确。"
        : params.password === "invalid"
          ? "请检查新密码长度和两次输入是否一致。"
          : null;

  return (
    <div className="grid gap-6">
      <PageHeader
        title="系统设置"
        description="按真实运维职责组织入口：安全、存储备份、版本信息、财务设置和帮助文档。教务规则已放入左侧教务分组。"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settingsItems.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className="shadow-none">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-primary/10 p-2 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="mt-1">{item.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href={item.href}>打开</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>我的登录密码</CardTitle>
          <CardDescription>
            账号拥有者可以自行修改密码；修改后请使用新密码重新登录。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {passwordMessage ? (
            <p className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
              {passwordMessage}
            </p>
          ) : null}
          <PasswordChangeForm redirectTo="/dashboard/settings" />
        </CardContent>
      </Card>
    </div>
  );
}
