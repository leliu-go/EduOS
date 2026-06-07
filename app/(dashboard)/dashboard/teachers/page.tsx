import Link from "next/link";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requirePermission } from "@/lib/rbac/require-permission";
import {
  getTeacherList,
  normalizeTeacherListQuery,
  type TeacherListQuery,
} from "@/features/teachers/queries";
import {
  formatTeacherList,
  teacherStatusLabels,
  teacherStatusValues,
} from "@/features/teachers/teacher-schema";
import { TeacherDeleteForm } from "@/features/teachers/teacher-delete-form";
import { TeacherCreateDialog } from "@/features/teachers/teacher-form-dialog";

type TeacherListPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type TeacherListItem = Awaited<ReturnType<typeof getTeacherList>>["teachers"][number];

const errorMessages = {
  invalid_input: "提交内容不完整，请检查后重试。",
  not_found: "未找到对应教师档案。",
} as const;

function buildTeachersHref(query: TeacherListQuery, page: number) {
  const params = new URLSearchParams();

  if (query.search) {
    params.set("search", query.search);
  }

  if (query.status) {
    params.set("status", query.status);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();

  return queryString ? `/dashboard/teachers?${queryString}` : "/dashboard/teachers";
}

function getColumns(): Array<DataTableColumn<TeacherListItem>> {
  return [
    {
      key: "name",
      header: "教师",
      cell: (teacher) => (
        <div>
          <Link
            href={`/dashboard/teachers/${teacher.id}`}
            className="font-medium text-foreground hover:text-primary"
          >
            {teacher.name}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">{teacher.phone}</p>
        </div>
      ),
    },
    {
      key: "subjects",
      header: "科目",
      cell: (teacher) => formatTeacherList(teacher.subjects),
    },
    {
      key: "grades",
      header: "年级",
      cell: (teacher) => formatTeacherList(teacher.grades),
    },
    {
      key: "status",
      header: "状态",
      cell: (teacher) => <Badge variant="secondary">{teacherStatusLabels[teacher.status]}</Badge>,
    },
    {
      key: "actions",
      header: "操作",
      className: "text-right",
      cell: (teacher) => (
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/teachers/${teacher.id}`}>查看</Link>
          </Button>
          <TeacherDeleteForm teacherId={teacher.id} teacherName={teacher.name} />
        </div>
      ),
    },
  ];
}

export default async function TeacherListPage({ searchParams }: TeacherListPageProps) {
  const currentUser = await requirePermission("teachers:manage", {
    nextPath: "/dashboard/teachers",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const query = normalizeTeacherListQuery(params);
  const result = await getTeacherList(currentUser.tenantId, query);
  const errorMessage =
    typeof params.error === "string"
      ? errorMessages[params.error as keyof typeof errorMessages]
      : null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">教师管理</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理教师档案、授课科目、年级范围和可授课时间。
          </p>
        </div>
        <TeacherCreateDialog />
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
          <CardTitle>筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/dashboard/teachers" className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
            <div className="grid gap-2">
              <Label htmlFor="teacher-search">搜索</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input
                  id="teacher-search"
                  name="search"
                  defaultValue={query.search}
                  placeholder="姓名、手机号、邮箱"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="teacher-status">状态</Label>
              <select
                id="teacher-status"
                name="status"
                defaultValue={query.status ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">全部状态</option>
                {teacherStatusValues.map((status) => (
                  <option key={status} value={status}>
                    {teacherStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full md:w-auto">
                查询
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result.total > 0 ? (
        <div className="grid gap-4">
          <DataTable
            columns={getColumns()}
            data={result.teachers}
            getRowKey={(teacher) => teacher.id}
          />
          <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>
              共 {result.total} 名教师，第 {result.page} / {result.pageCount} 页
            </span>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" aria-disabled={result.page <= 1}>
                <Link href={buildTeachersHref(query, Math.max(1, result.page - 1))}>上一页</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                aria-disabled={result.page >= result.pageCount}
              >
                <Link href={buildTeachersHref(query, Math.min(result.pageCount, result.page + 1))}>
                  下一页
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="暂无教师档案"
          description="创建教师后，可继续维护课程、班级和排课信息。"
          action={<TeacherCreateDialog />}
        />
      )}
    </div>
  );
}
