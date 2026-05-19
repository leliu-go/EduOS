import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { EnrollmentCreateDialog } from "@/features/enrollments/enrollment-create-dialog";
import { enrollmentStatusLabels } from "@/features/enrollments/enrollment-schema";
import { getEnrollmentFormOptions, getEnrollmentList } from "@/features/enrollments/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

type EnrollmentListPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type EnrollmentList = Awaited<ReturnType<typeof getEnrollmentList>>;
type EnrollmentListItem = EnrollmentList["items"][number];

const errorMessages = {
  invalid_input: "报名信息不完整，请检查后重试。",
  invalid_scope: "请选择当前机构下有效的学生、课程和班级。",
} as const;

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getStringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function getPageParam(value: string | string[] | undefined) {
  const page = typeof value === "string" ? Number(value) : 1;

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getEnrollmentsHref({ query, page }: { query: string; page: number }) {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const queryString = searchParams.toString();

  return queryString ? `/dashboard/enrollments?${queryString}` : "/dashboard/enrollments";
}

function getEnrollmentColumns(): Array<DataTableColumn<EnrollmentListItem>> {
  return [
    {
      key: "student",
      header: "学生",
      cell: (enrollment) => enrollment.student.name,
    },
    {
      key: "course",
      header: "课程",
      cell: (enrollment) =>
        `${enrollment.courseProduct.name} · ${enrollment.courseProduct.subject.name}/${enrollment.courseProduct.grade.name}`,
    },
    {
      key: "classGroup",
      header: "班级",
      cell: (enrollment) => enrollment.classGroup?.name ?? "暂不分班",
    },
    {
      key: "hours",
      header: "本次课时",
      cell: (enrollment) => `${enrollment.purchasedHours} 课时`,
    },
    {
      key: "enrolledAt",
      header: "报名日期",
      cell: (enrollment) => formatDate(enrollment.enrolledAt),
    },
    {
      key: "status",
      header: "状态",
      cell: (enrollment) => (
        <Badge variant="secondary">{enrollmentStatusLabels[enrollment.status]}</Badge>
      ),
    },
  ];
}

export default async function EnrollmentListPage({ searchParams }: EnrollmentListPageProps) {
  const currentUser = await requirePermission("enrollments:manage", {
    nextPath: "/dashboard/enrollments",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const query = getStringParam(params.q);
  const page = getPageParam(params.page);
  const [enrollments, options] = await Promise.all([
    getEnrollmentList(currentUser.tenantId, {
      query,
      page,
    }),
    getEnrollmentFormOptions(currentUser.tenantId),
  ]);
  const pageCount = enrollments.pageCount;
  const errorMessage =
    typeof params.error === "string"
      ? errorMessages[params.error as keyof typeof errorMessages]
      : null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">报名</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            为学生创建正式报名记录，并同步创建或更新课程账户。
          </p>
        </div>
        <EnrollmentCreateDialog options={options} />
      </div>

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
          <CardTitle>报名记录</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input name="q" defaultValue={query} placeholder="搜索学生、课程或班级" />
            <Button type="submit" variant="outline">
              搜索
            </Button>
          </form>

          {enrollments.items.length > 0 ? (
            <>
              <DataTable
                columns={getEnrollmentColumns()}
                data={enrollments.items}
                getRowKey={(enrollment) => enrollment.id}
              />
              <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <span>
                  共 {enrollments.total} 条报名，第 {enrollments.page} / {pageCount} 页
                </span>
                <div className="flex gap-2">
                  {enrollments.page <= 1 ? (
                    <Button variant="outline" size="sm" disabled>
                      上一页
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={getEnrollmentsHref({
                          query,
                          page: Math.max(enrollments.page - 1, 1),
                        })}
                      >
                        上一页
                      </Link>
                    </Button>
                  )}
                  {enrollments.page >= pageCount ? (
                    <Button variant="outline" size="sm" disabled>
                      下一页
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={getEnrollmentsHref({
                          query,
                          page: Math.min(enrollments.page + 1, pageCount),
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
              title="暂无报名记录"
              description="新增报名后，学生端即可看到已报名课程。"
              action={<EnrollmentCreateDialog options={options} />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
