import Link from "next/link";
import { BookOpen, CreditCard, FileText, UserCircle, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudentsForParentUser } from "@/features/guardians/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

function getStudentMeta(student: { grade: string; school: string | null }) {
  return [student.grade, student.school].filter(Boolean).join(" / ");
}

export default async function ParentProfilePage() {
  const currentUser = await requirePermission("route:parent", {
    nextPath: "/parent/me",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const bindings = await getStudentsForParentUser(currentUser.tenantId, currentUser.id);

  return (
    <div className="grid gap-4">
      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-normal text-foreground">我的</h2>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserCircle className="size-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <CardTitle>{currentUser.name}</CardTitle>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {currentUser.email ?? "未绑定邮箱"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>所属机构：{currentUser.tenantName}</p>
            <p>绑定孩子：{bindings.length} 位</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <Button asChild variant="outline" className="h-auto flex-col gap-2 py-3">
          <Link href="/parent/reports">
            <FileText className="size-4" aria-hidden="true" />
            报告
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col gap-2 py-3">
          <Link href="/parent/consumption">
            <BookOpen className="size-4" aria-hidden="true" />
            课消
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col gap-2 py-3">
          <Link href="/parent/payments">
            <CreditCard className="size-4" aria-hidden="true" />
            缴费
          </Link>
        </Button>
      </section>

      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-normal text-foreground">绑定孩子</h2>
        {bindings.length > 0 ? (
          bindings.map((binding) => (
            <Card key={binding.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Users className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{binding.student.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {getStudentMeta(binding.student) || "暂无年级学校信息"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            title="暂无绑定孩子"
            description="机构完成监护人绑定后，你可以在这里查看孩子信息。"
          />
        )}
      </section>
    </div>
  );
}
