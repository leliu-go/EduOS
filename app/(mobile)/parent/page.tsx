import { BookOpen, UserCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { calculateCourseAccountBalance } from "@/features/course-accounts/balance";
import { getParentCourseAccounts } from "@/features/course-accounts/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function ParentHomePage() {
  const currentUser = await requirePermission("route:parent", {
    nextPath: "/parent",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const accounts = await getParentCourseAccounts(currentUser.tenantId, currentUser.id);

  if (accounts.length === 0) {
    return <EmptyState title="暂无课时账户" description="绑定孩子报名后，可在这里查看剩余课时。" />;
  }

  return (
    <div className="grid gap-4">
      {accounts.map((account) => {
        const balance = calculateCourseAccountBalance(account);

        return (
          <Card key={account.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{account.courseProduct.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {account.courseProduct.subject.name} · {account.courseProduct.grade.name}
                  </p>
                </div>
                <Badge variant="secondary">剩余 {balance.remainingHours} 课时</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <UserCircle className="size-4" aria-hidden="true" />
                {account.student.name}
              </p>
              <p className="flex items-center gap-2">
                <BookOpen className="size-4" aria-hidden="true" />
                已购 {account.purchasedHours} · 赠送 {account.giftHours} · 已用 {account.usedHours}{" "}
                · 冻结 {account.frozenHours}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
