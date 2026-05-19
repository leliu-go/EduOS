import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { CourseProductCreateDialog } from "@/features/courses/course-product-form-dialog";
import {
  classTypeLabels,
  courseProductStatusLabels,
  courseProductStatusValues,
  courseTypeLabels,
} from "@/features/courses/course-product-schema";
import {
  getCourseProductFormOptions,
  getCourseProductList,
  type CourseProductListStatusFilter,
} from "@/features/courses/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

type CourseProductListPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type CourseProductList = Awaited<ReturnType<typeof getCourseProductList>>;
type CourseProductListItem = CourseProductList["items"][number];

const errorMessages = {
  invalid_input: "课程信息不完整，请检查后重试。",
  invalid_config: "请选择当前机构下有效的科目和年级。",
  not_found: "未找到对应课程产品。",
} as const;

function formatPrice(price: { toString(): string }) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 2,
  }).format(Number(price.toString()));
}

function getStringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function getPageParam(value: string | string[] | undefined) {
  const page = typeof value === "string" ? Number(value) : 1;

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getStatusParam(
  value: string | string[] | undefined,
): CourseProductListStatusFilter | undefined {
  if (value === "ACTIVE" || value === "INACTIVE") {
    return value;
  }

  return undefined;
}

function getCoursesHref({
  query,
  status,
  page,
}: {
  query: string;
  status?: CourseProductListStatusFilter;
  page: number;
}) {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  if (status) {
    searchParams.set("status", status);
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const queryString = searchParams.toString();

  return queryString ? `/dashboard/courses?${queryString}` : "/dashboard/courses";
}

function getCourseProductColumns(): Array<DataTableColumn<CourseProductListItem>> {
  return [
    {
      key: "name",
      header: "课程",
      cell: (courseProduct) => (
        <Link className="font-medium text-primary" href={`/dashboard/courses/${courseProduct.id}`}>
          {courseProduct.name}
        </Link>
      ),
    },
    {
      key: "subject",
      header: "科目/年级",
      cell: (courseProduct) => `${courseProduct.subject.name} · ${courseProduct.grade.name}`,
    },
    {
      key: "courseType",
      header: "类型",
      cell: (courseProduct) =>
        `${courseTypeLabels[courseProduct.courseType]} · ${classTypeLabels[courseProduct.classType]}`,
    },
    {
      key: "totalHours",
      header: "课时",
      cell: (courseProduct) => `${courseProduct.totalHours} 课时`,
    },
    {
      key: "price",
      header: "价格",
      cell: (courseProduct) => formatPrice(courseProduct.price),
    },
    {
      key: "status",
      header: "状态",
      cell: (courseProduct) => (
        <Badge variant="secondary">{courseProductStatusLabels[courseProduct.status]}</Badge>
      ),
    },
    {
      key: "actions",
      header: "操作",
      className: "text-right",
      cell: (courseProduct) => (
        <Button asChild size="sm" variant="outline">
          <Link href={`/dashboard/courses/${courseProduct.id}`}>查看</Link>
        </Button>
      ),
    },
  ];
}

export default async function CourseProductListPage({ searchParams }: CourseProductListPageProps) {
  const currentUser = await requirePermission("courses:manage", {
    nextPath: "/dashboard/courses",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const query = getStringParam(params.q);
  const status = getStatusParam(params.status);
  const page = getPageParam(params.page);
  const [courseProducts, options] = await Promise.all([
    getCourseProductList(currentUser.tenantId, {
      query,
      status,
      page,
    }),
    getCourseProductFormOptions(currentUser.tenantId),
  ]);
  const pageCount = courseProducts.pageCount;
  const errorMessage =
    typeof params.error === "string"
      ? errorMessages[params.error as keyof typeof errorMessages]
      : null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">课程产品</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理机构可售课程，包含科目、年级、课型、课时、价格和上下架状态。
          </p>
        </div>
        <CourseProductCreateDialog options={options} />
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
          <CardTitle>课程列表</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <Input name="q" defaultValue={query} placeholder="搜索课程、科目、年级" />
            <select
              name="status"
              defaultValue={status ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">全部状态</option>
              {courseProductStatusValues
                .filter((statusValue) => statusValue !== "ARCHIVED")
                .map((statusValue) => (
                  <option key={statusValue} value={statusValue}>
                    {courseProductStatusLabels[statusValue]}
                  </option>
                ))}
            </select>
            <Button type="submit" variant="outline">
              筛选
            </Button>
          </form>

          {courseProducts.items.length > 0 ? (
            <>
              <DataTable
                columns={getCourseProductColumns()}
                data={courseProducts.items}
                getRowKey={(courseProduct) => courseProduct.id}
              />
              <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <span>
                  共 {courseProducts.total} 个课程，第 {courseProducts.page} / {pageCount} 页
                </span>
                <div className="flex gap-2">
                  {courseProducts.page <= 1 ? (
                    <Button variant="outline" size="sm" disabled>
                      上一页
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={getCoursesHref({
                          query,
                          status,
                          page: Math.max(courseProducts.page - 1, 1),
                        })}
                      >
                        上一页
                      </Link>
                    </Button>
                  )}
                  {courseProducts.page >= pageCount ? (
                    <Button variant="outline" size="sm" disabled>
                      下一页
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={getCoursesHref({
                          query,
                          status,
                          page: Math.min(courseProducts.page + 1, pageCount),
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
              title="暂无课程产品"
              description="创建课程前，请先完成科目和年级配置。"
              action={<CourseProductCreateDialog options={options} />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
