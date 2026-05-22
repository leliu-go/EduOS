import Link from "next/link";
import {
  Archive,
  Building2,
  CreditCard,
  ShieldCheck,
  SlidersHorizontal,
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
    description: "机构名称、校区资料和运营基础信息。",
    href: "/dashboard/campuses",
    icon: Building2,
  },
  {
    title: "安全中心",
    description: "MFA 状态、审计日志和高权限账号安全。",
    href: "/dashboard/settings/security",
    icon: ShieldCheck,
  },
  {
    title: "存储状态",
    description: "查看 storage provider、OSS bucket 和 signed URL 策略。",
    href: "/dashboard/settings/storage",
    icon: Archive,
  },
  {
    title: "版本与更新",
    description: "检查更新、查看版本信息和发布记录。",
    href: "/dashboard/settings/version",
    icon: Sparkles,
  },
  {
    title: "财务设置",
    description: "人工收款方式、对账规则和 provider abstraction。",
    href: "/dashboard/payments",
    icon: CreditCard,
  },
  {
    title: "合规设置",
    description: "合同、退费、课消和未成年人数据保护规则。",
    href: "/dashboard/academic-config",
    icon: SlidersHorizontal,
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
      <PageHeader title="系统设置" description="集中查看机构、存储、安全、版本、财务和合规入口。" />

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
          <CardDescription>账号拥有者可以自行修改密码；修改后请使用新密码重新登录。</CardDescription>
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
