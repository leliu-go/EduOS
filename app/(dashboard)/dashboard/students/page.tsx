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
  getStudentList,
  normalizeStudentListQuery,
  type StudentListQuery,
} from "@/features/students/queries";
import {
  formatStudentBirthday,
  studentStatusLabels,
  studentStatusValues,
} from "@/features/students/student-schema";
import { StudentCreateDialog } from "@/features/students/student-form-dialog";

type StudentListPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type StudentListItem = Awaited<ReturnType<typeof getStudentList>>["students"][number];

const errorMessages = {
  invalid_input: "提交内容不完整，请检查后重试。",
  not_found: "未找到对应学生档案。",
} as const;

function buildStudentsHref(query: StudentListQuery, page: number) {
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

  return queryString ? `/dashboard/students?${queryString}` : "/dashboard/students";
}

function getColumns(): Array<DataTableColumn<StudentListItem>> {
  return [
    {
      key: "name",
      header: "学生",
      cell: (student) => (
        <div>
          <Link
            href={`/dashboard/students/${student.id}`}
            className="font-medium text-foreground hover:text-primary"
          >
            {student.name}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">{student.school ?? "学校未填写"}</p>
        </div>
      ),
    },
    {
      key: "grade",
      header: "年级",
      cell: (student) => student.grade,
    },
    {
      key: "birthday",
      header: "生日",
      cell: (student) => formatStudentBirthday(student.birthday) || "未填写",
    },
    {
      key: "status",
      header: "状态",
      cell: (student) => <Badge variant="secondary">{studentStatusLabels[student.status]}</Badge>,
    },
    {
      key: "actions",
      header: "操作",
      className: "text-right",
      cell: (student) => (
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/students/${student.id}`}>查看</Link>
        </Button>
      ),
    },
  ];
}

export default async function StudentListPage({ searchParams }: StudentListPageProps) {
  const currentUser = await requirePermission("students:manage", {
    nextPath: "/dashboard/students",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const query = normalizeStudentListQuery(params);
  const result = await getStudentList(currentUser.tenantId, query);
  const errorMessage =
    typeof params.error === "string"
      ? errorMessages[params.error as keyof typeof errorMessages]
      : null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">学生管理</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理本机构学生档案，支持搜索、筛选、创建和维护基础信息。
          </p>
        </div>
        <StudentCreateDialog />
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
          <form action="/dashboard/students" className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
            <div className="grid gap-2">
              <Label htmlFor="student-search">搜索</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input
                  id="student-search"
                  name="search"
                  defaultValue={query.search}
                  placeholder="姓名、年级、学校"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-status">状态</Label>
              <select
                id="student-status"
                name="status"
                defaultValue={query.status ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">全部状态</option>
                {studentStatusValues.map((status) => (
                  <option key={status} value={status}>
                    {studentStatusLabels[status]}
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
            data={result.students}
            getRowKey={(student) => student.id}
          />
          <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>
              共 {result.total} 名学生，第 {result.page} / {result.pageCount} 页
            </span>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" aria-disabled={result.page <= 1}>
                <Link href={buildStudentsHref(query, Math.max(1, result.page - 1))}>上一页</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                aria-disabled={result.page >= result.pageCount}
              >
                <Link href={buildStudentsHref(query, Math.min(result.pageCount, result.page + 1))}>
                  下一页
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="暂无学生档案"
          description="创建第一位学生后，可继续维护课程、班级和监护人关系。"
          action={<StudentCreateDialog />}
        />
      )}
    </div>
  );
}
