import { KeyRound } from "lucide-react";

import { AccountCreateDialog } from "@/features/accounts/account-create-dialog";
import { getAccountInvitationTargets } from "@/features/accounts/queries";
import { requirePermission } from "@/lib/rbac/require-permission";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

type TeacherAccountsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TeacherAccountsPage({ searchParams }: TeacherAccountsPageProps) {
  const currentUser = await requirePermission("accounts:invite", {
    nextPath: "/teacher/accounts",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const created = params.created === "1";
  const targets = await getAccountInvitationTargets(currentUser.tenantId, currentUser);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="size-5 text-primary" aria-hidden="true" />
            学生账号开通
          </CardTitle>
          <CardDescription>
            老师只能为自己授课班级内、尚未绑定账号的学生创建登录账号。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {created ? (
            <p className="rounded-md border border-primary/30 px-3 py-2 text-sm text-primary">
              学生账号已创建，请线下安全告知初始密码。
            </p>
          ) : null}
        </CardContent>
      </Card>

      {targets.students.length > 0 ? (
        <section className="grid gap-3">
          {targets.students.map((student) => (
            <Card key={student.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">{student.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {student.grade}
                    {student.school ? ` / ${student.school}` : ""}
                  </p>
                </div>
                <AccountCreateDialog
                  targetType="STUDENT"
                  targetId={student.id}
                  targetName={student.name}
                  redirectTo="/teacher/accounts"
                />
              </CardContent>
            </Card>
          ))}
        </section>
      ) : (
        <EmptyState
          title="暂无可开通账号的学生"
          description="只有自己授课班级内、尚未绑定账号的学生会显示在这里。"
        />
      )}
    </div>
  );
}
