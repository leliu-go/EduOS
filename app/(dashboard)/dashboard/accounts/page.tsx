import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { requirePermission } from "@/lib/rbac/require-permission";
import { AccountCreateDialog } from "@/features/accounts/account-create-dialog";
import {
  importAccountsAction,
  unlockAccountAction,
} from "@/features/accounts/actions";
import { getAccountDirectory, getAccountInvitationTargets } from "@/features/accounts/queries";
import { accountTargetLabels, type AccountTargetType } from "@/features/accounts/account-schema";

type AccountPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type AccountTarget = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  description: string;
};
type AccountDirectoryItem = Awaited<ReturnType<typeof getAccountDirectory>>[number];

const errorMessages = {
  invalid_input: "账号信息不完整，请检查后重试。",
  target_not_found: "目标档案不存在，或已开通账号。",
  invalid_scope: "当前角色不能创建或管理该账号。",
} as const;

function getLockStatus(account: AccountDirectoryItem) {
  if (account.loginPermanentlyLockedAt) {
    return "已封禁";
  }

  if (account.loginLockedUntil && account.loginLockedUntil > new Date()) {
    return "临时锁定";
  }

  return "正常";
}

function formatDateTime(value: Date | null) {
  return value ? value.toISOString().slice(0, 16).replace("T", " ") : "-";
}

function getAccountColumns(): Array<DataTableColumn<AccountDirectoryItem>> {
  return [
    {
      key: "name",
      header: "账号",
      cell: (account) => (
        <div>
          <p className="font-medium text-foreground">{account.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {account.email ?? account.phone ?? "未绑定联系方式"}
          </p>
        </div>
      ),
    },
    {
      key: "role",
      header: "角色",
      cell: (account) => (
        <div className="flex flex-wrap gap-1">
          {account.memberships.map((membership) => (
            <Badge key={`${account.id}-${membership.role.key}`} variant="secondary">
              {membership.role.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: "状态",
      cell: (account) => (
        <div className="grid gap-1">
          <Badge variant={account.status === "ACTIVE" ? "secondary" : "outline"}>
            {account.status === "ACTIVE" ? "启用" : "停用"}
          </Badge>
          <span className="text-xs text-muted-foreground">{getLockStatus(account)}</span>
        </div>
      ),
    },
    {
      key: "lastLogin",
      header: "最近登录",
      cell: (account) => formatDateTime(account.lastLoginAt),
    },
    {
      key: "actions",
      header: "操作",
      className: "text-right",
      cell: (account) =>
        account.loginPermanentlyLockedAt || account.loginLockedUntil ? (
          <form action={unlockAccountAction}>
            <input type="hidden" name="userId" value={account.id} />
            <Button type="submit" size="sm" variant="outline">
              解锁
            </Button>
          </form>
        ) : (
          <span className="text-xs text-muted-foreground">无需处理</span>
        ),
    },
  ];
}

function getColumns(targetType: AccountTargetType): Array<DataTableColumn<AccountTarget>> {
  return [
    {
      key: "name",
      header: accountTargetLabels[targetType],
      cell: (target) => (
        <div>
          <p className="font-medium text-foreground">{target.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{target.description}</p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "联系方式",
      cell: (target) => target.email ?? target.phone ?? "待填写",
    },
    {
      key: "role",
      header: "角色",
      cell: () => <Badge variant="secondary">{accountTargetLabels[targetType]}</Badge>,
    },
    {
      key: "actions",
      header: "操作",
      className: "text-right",
      cell: (target) => (
        <AccountCreateDialog
          targetType={targetType}
          targetId={target.id}
          targetName={target.name}
          defaultEmail={target.email}
          defaultPhone={target.phone}
        />
      ),
    },
  ];
}

function TargetSection({
  title,
  targetType,
  targets,
}: {
  title: string;
  targetType: AccountTargetType;
  targets: AccountTarget[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {targets.length > 0 ? (
          <DataTable
            columns={getColumns(targetType)}
            data={targets}
            getRowKey={(target) => target.id}
          />
        ) : (
          <EmptyState
            title={`暂无可开通的${accountTargetLabels[targetType]}档案`}
            description="已绑定账号的档案不会出现在这里。"
          />
        )}
      </CardContent>
    </Card>
  );
}

export default async function AccountCreationPage({ searchParams }: AccountPageProps) {
  const currentUser = await requirePermission("accounts:invite", {
    nextPath: "/dashboard/accounts",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const targets = await getAccountInvitationTargets(currentUser.tenantId, currentUser);
  const accountDirectory = await getAccountDirectory(currentUser.tenantId);
  const errorMessage =
    typeof params.error === "string"
      ? errorMessages[params.error as keyof typeof errorMessages]
      : null;
  const created = params.created === "1";
  const imported = params.imported === "1";
  const unlocked = params.unlocked === "1";
  const teacherTargets = targets.teachers.map((teacher) => ({
    id: teacher.id,
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone,
    description: `${teacher.subjects.join("、")} / ${teacher.grades.join("、")}`,
  }));
  const studentTargets = targets.students.map((student) => ({
    id: student.id,
    name: student.name,
    description: `${student.grade}${student.school ? ` / ${student.school}` : ""}`,
  }));
  const guardianTargets = targets.guardians.map((guardian) => ({
    id: guardian.id,
    name: guardian.name,
    email: guardian.email,
    phone: guardian.phone,
    description: "监护人档案",
  }));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">账号开通</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          为已有教师、学生和监护人档案创建登录账号，并分配对应角色。
        </p>
      </div>

      {created ? (
        <p className="rounded-md border border-primary/30 px-3 py-2 text-sm text-primary">
          账号已创建，请安全告知用户初始密码。
        </p>
      ) : null}

      {imported ? (
        <p className="rounded-md border border-primary/30 px-3 py-2 text-sm text-primary">
          账号导入已完成。
        </p>
      ) : null}

      {unlocked ? (
        <p className="rounded-md border border-primary/30 px-3 py-2 text-sm text-primary">
          账号登录锁定已解除。
        </p>
      ) : null}

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>账号库</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              统一管理本机构登录账号、角色、登录锁定状态和导入导出。
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/accounts/template">下载导入模板</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/accounts/export">导出账号 CSV</Link>
              </Button>
            </div>
          </div>
          <form action={importAccountsAction} className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_auto] md:items-end">
            <div className="grid gap-2">
              <label htmlFor="account-import-file" className="text-sm font-medium">
                导入账号 CSV
              </label>
              <input
                id="account-import-file"
                name="file"
                type="file"
                accept=".csv,text/csv"
                required
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                请先下载模板填写。初始密码只用于导入，不会导出已有密码或密码哈希。
              </p>
            </div>
            <Button type="submit">导入</Button>
          </form>
          {accountDirectory.length > 0 ? (
            <DataTable
              columns={getAccountColumns()}
              data={accountDirectory}
              getRowKey={(account) => account.id}
            />
          ) : (
            <EmptyState title="暂无账号" description="创建或导入账号后会显示在这里。" />
          )}
        </CardContent>
      </Card>

      <TargetSection title="教师账号" targetType="TEACHER" targets={teacherTargets} />
      <TargetSection title="学生账号" targetType="STUDENT" targets={studentTargets} />
      <TargetSection title="家长账号" targetType="GUARDIAN" targets={guardianTargets} />
    </div>
  );
}
