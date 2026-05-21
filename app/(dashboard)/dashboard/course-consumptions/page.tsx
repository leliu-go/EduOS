import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { calculateCourseAccountBalance } from "@/features/course-accounts/balance";
import { getCourseConsumptionLedger } from "@/features/course-consumptions/queries";
import { CourseConsumptionReversalDialog } from "@/features/course-consumptions/reversal-dialog";
import { requirePermission } from "@/lib/rbac/require-permission";

type CourseConsumptionLedgerPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type CourseConsumptionLedger = Awaited<ReturnType<typeof getCourseConsumptionLedger>>;
type CourseConsumptionLedgerItem = CourseConsumptionLedger["items"][number];

function getStringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function getDateParam(value: string | string[] | undefined) {
  const date = getStringParam(value);

  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

function getPageParam(value: string | string[] | undefined) {
  const page = typeof value === "string" ? Number(value) : 1;

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function formatDateTime(value: Date) {
  return value.toISOString().slice(0, 16).replace("T", " ");
}

function getCourseConsumptionsHref({
  query,
  dateFrom,
  dateTo,
  page,
}: {
  query: string;
  dateFrom: string;
  dateTo: string;
  page: number;
}) {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  if (dateFrom) {
    searchParams.set("dateFrom", dateFrom);
  }

  if (dateTo) {
    searchParams.set("dateTo", dateTo);
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const queryString = searchParams.toString();

  return queryString
    ? `/dashboard/course-consumptions?${queryString}`
    : "/dashboard/course-consumptions";
}

function getLedgerColumns(): Array<DataTableColumn<CourseConsumptionLedgerItem>> {
  return [
    {
      key: "student",
      header: "学生",
      cell: (item) => item.student.name,
    },
    {
      key: "course",
      header: "课程",
      cell: (item) =>
        `${item.courseProduct.name} / ${item.courseProduct.subject.name}/${item.courseProduct.grade.name}`,
    },
    {
      key: "class",
      header: "班级",
      cell: (item) => item.schedule.classGroup.name,
    },
    {
      key: "lesson",
      header: "上课时间",
      cell: (item) =>
        `${formatDateTime(item.schedule.startAt)} - ${formatDateTime(item.schedule.endAt)}`,
    },
    {
      key: "consumed",
      header: "扣课",
      cell: (item) => <Badge variant="secondary">{item.consumedHours} 课时</Badge>,
    },
    {
      key: "status",
      header: "状态",
      cell: (item) => (
        <Badge variant={item.reversedAt ? "outline" : "secondary"}>
          {item.reversedAt ? "已冲正" : "有效"}
        </Badge>
      ),
    },
    {
      key: "balance",
      header: "当前余额",
      cell: (item) => {
        const balance = calculateCourseAccountBalance(item.courseAccount);

        return (
          <span className={balance.isNegative ? "text-destructive" : undefined}>
            剩余 {balance.remainingHours} / 总 {balance.totalHours} 课时
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "操作",
      cell: (item) => (
        <CourseConsumptionReversalDialog
          courseConsumptionId={item.id}
          disabled={Boolean(item.reversedAt)}
        />
      ),
    },
  ];
}

export default async function CourseConsumptionLedgerPage({
  searchParams,
}: CourseConsumptionLedgerPageProps) {
  const currentUser = await requirePermission("courseConsumption:view", {
    nextPath: "/dashboard",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const query = getStringParam(params.q);
  const dateFrom = getDateParam(params.dateFrom);
  const dateTo = getDateParam(params.dateTo);
  const page = getPageParam(params.page);
  const ledger = await getCourseConsumptionLedger(currentUser.tenantId, {
    query,
    dateFrom,
    dateTo,
    page,
  });
  const pageCount = ledger.pageCount;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">课消流水</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          按学生、课程、班级和日期筛选扣课历史，核对每条扣课后的当前课时余额。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>扣课记录</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form className="grid gap-3 lg:grid-cols-[1fr_12rem_12rem_auto]">
            <Input name="q" defaultValue={query} placeholder="搜索学生、课程或班级" />
            <Input name="dateFrom" defaultValue={dateFrom} type="date" aria-label="开始日期" />
            <Input name="dateTo" defaultValue={dateTo} type="date" aria-label="结束日期" />
            <Button type="submit" variant="outline">
              搜索
            </Button>
          </form>

          {ledger.items.length > 0 ? (
            <>
              <DataTable
                columns={getLedgerColumns()}
                data={ledger.items}
                getRowKey={(item) => item.id}
              />
              <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <span>
                  共 {ledger.total} 条记录，第 {ledger.page} / {pageCount} 页
                </span>
                <div className="flex gap-2">
                  {ledger.page <= 1 ? (
                    <Button variant="outline" size="sm" disabled>
                      上一页
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={getCourseConsumptionsHref({
                          query,
                          dateFrom,
                          dateTo,
                          page: Math.max(ledger.page - 1, 1),
                        })}
                      >
                        上一页
                      </Link>
                    </Button>
                  )}
                  {ledger.page >= pageCount ? (
                    <Button variant="outline" size="sm" disabled>
                      下一页
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={getCourseConsumptionsHref({
                          query,
                          dateFrom,
                          dateTo,
                          page: Math.min(ledger.page + 1, pageCount),
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
            <EmptyState
              title="暂无课消流水"
              description="确认考勤并完成扣课后，会在这里显示记录；错误扣课请走课消冲正。"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
