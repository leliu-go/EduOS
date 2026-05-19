import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { calculateCourseAccountBalance } from "@/features/course-accounts/balance";
import { getCourseAccountList } from "@/features/course-accounts/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

type CourseAccountListPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type CourseAccountList = Awaited<ReturnType<typeof getCourseAccountList>>;
type CourseAccountListItem = CourseAccountList["items"][number];

function getStringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function getPageParam(value: string | string[] | undefined) {
  const page = typeof value === "string" ? Number(value) : 1;

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getCourseAccountsHref({ query, page }: { query: string; page: number }) {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const queryString = searchParams.toString();

  return queryString ? `/dashboard/course-accounts?${queryString}` : "/dashboard/course-accounts";
}

function getCourseAccountColumns(): Array<DataTableColumn<CourseAccountListItem>> {
  return [
    {
      key: "student",
      header: "学生",
      cell: (account) => account.student.name,
    },
    {
      key: "course",
      header: "课程",
      cell: (account) =>
        `${account.courseProduct.name} · ${account.courseProduct.subject.name}/${account.courseProduct.grade.name}`,
    },
    {
      key: "total",
      header: "总课时",
      cell: (account) => `${calculateCourseAccountBalance(account).totalHours} 课时`,
    },
    {
      key: "used",
      header: "已用/冻结",
      cell: (account) => `${account.usedHours}/${account.frozenHours} 课时`,
    },
    {
      key: "remaining",
      header: "剩余",
      cell: (account) => {
        const balance = calculateCourseAccountBalance(account);

        return (
          <span className={balance.isNegative ? "text-destructive" : undefined}>
            {balance.remainingHours} 课时
          </span>
        );
      },
    },
    {
      key: "status",
      header: "状态",
      cell: (account) => <Badge variant="secondary">{account.status}</Badge>,
    },
  ];
}

export default async function CourseAccountListPage({ searchParams }: CourseAccountListPageProps) {
  const currentUser = await requirePermission("courseConsumption:view", {
    nextPath: "/dashboard/course-accounts",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const query = getStringParam(params.q);
  const page = getPageParam(params.page);
  const accounts = await getCourseAccountList(currentUser.tenantId, {
    query,
    page,
  });
  const pageCount = accounts.pageCount;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">课时账户</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          查看学生课程账户的购买、赠送、已用、冻结和剩余课时。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>账户列表</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input name="q" defaultValue={query} placeholder="搜索学生或课程" />
            <Button type="submit" variant="outline">
              搜索
            </Button>
          </form>

          {accounts.items.length > 0 ? (
            <>
              <DataTable
                columns={getCourseAccountColumns()}
                data={accounts.items}
                getRowKey={(account) => account.id}
              />
              <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <span>
                  共 {accounts.total} 个账户，第 {accounts.page} / {pageCount} 页
                </span>
                <div className="flex gap-2">
                  {accounts.page <= 1 ? (
                    <Button variant="outline" size="sm" disabled>
                      上一页
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={getCourseAccountsHref({
                          query,
                          page: Math.max(accounts.page - 1, 1),
                        })}
                      >
                        上一页
                      </Link>
                    </Button>
                  )}
                  {accounts.page >= pageCount ? (
                    <Button variant="outline" size="sm" disabled>
                      下一页
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={getCourseAccountsHref({
                          query,
                          page: Math.min(accounts.page + 1, pageCount),
                        })}
                      >
                        下一页
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <EmptyState title="暂无课时账户" description="报名创建后会自动生成或更新课程账户。" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
