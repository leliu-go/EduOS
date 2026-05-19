import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { requirePermission } from "@/lib/rbac/require-permission";
import { AccountCreateDialog } from "@/features/accounts/account-create-dialog";
import { getAccountInvitationTargets } from "@/features/accounts/queries";
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

const errorMessages = {
  invalid_input: "账号信息不完整，请检查后重试。",
  target_not_found: "目标档案不存在，或已开通账号。",
} as const;

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
  const targets = await getAccountInvitationTargets(currentUser.tenantId);
  const errorMessage =
    typeof params.error === "string"
      ? errorMessages[params.error as keyof typeof errorMessages]
      : null;
  const created = params.created === "1";
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

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      <TargetSection title="教师账号" targetType="TEACHER" targets={teacherTargets} />
      <TargetSection title="学生账号" targetType="STUDENT" targets={studentTargets} />
      <TargetSection title="家长账号" targetType="GUARDIAN" targets={guardianTargets} />
    </div>
  );
}
