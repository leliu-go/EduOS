import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ClassGroupEditDialog,
  ClassGroupStudentAddDialog,
} from "@/features/classes/class-group-form-dialog";
import { ClassGroupDeleteForm } from "@/features/classes/class-group-delete-form";
import { ClassGroupStudentRemoveForm } from "@/features/classes/class-group-student-remove-form";
import { classGroupStatusLabels } from "@/features/classes/class-group-schema";
import {
  getClassGroupById,
  getClassGroupFormOptions,
  getClassGroupStudentOptions,
} from "@/features/classes/queries";
import { studentStatusLabels } from "@/features/students/student-schema";
import { requirePermission } from "@/lib/rbac/require-permission";

type ClassGroupDetailPageProps = {
  params: Promise<{
    classGroupId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ClassGroupDetail = NonNullable<Awaited<ReturnType<typeof getClassGroupById>>>;
type ClassGroupRosterItem = ClassGroupDetail["students"][number];

const errorMessages = {
  capacity_warning: "班级容量已满。如需继续添加，请勾选容量超额确认。",
  invalid_student: "学生信息不完整，请检查后重试。",
  not_found: "未找到对应班级或学生。",
} as const;

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getRosterColumns(classGroupId: string): Array<DataTableColumn<ClassGroupRosterItem>> {
  return [
    {
      key: "student",
      header: "学生",
      cell: (item) => item.student.name,
    },
    {
      key: "grade",
      header: "年级",
      cell: (item) => item.student.grade,
    },
    {
      key: "status",
      header: "状态",
      cell: (item) => <Badge variant="secondary">{studentStatusLabels[item.student.status]}</Badge>,
    },
    {
      key: "actions",
      header: "操作",
      className: "text-right",
      cell: (item) => (
        <ClassGroupStudentRemoveForm classGroupId={classGroupId} classGroupStudentId={item.id} />
      ),
    },
  ];
}

export default async function ClassGroupDetailPage({
  params,
  searchParams,
}: ClassGroupDetailPageProps) {
  const currentUser = await requirePermission("classes:manage", {
    nextPath: "/dashboard/classes",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const { classGroupId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [classGroup, options, students] = await Promise.all([
    getClassGroupById(currentUser.tenantId, classGroupId),
    getClassGroupFormOptions(currentUser.tenantId),
    getClassGroupStudentOptions(currentUser.tenantId),
  ]);
  const errorMessage =
    typeof resolvedSearchParams.error === "string"
      ? errorMessages[resolvedSearchParams.error as keyof typeof errorMessages]
      : null;

  if (!classGroup) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">
              {classGroup.name}
            </h1>
            <Badge variant="secondary">{classGroupStatusLabels[classGroup.status]}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            班级花名册用于排课和教师查看，不创建正式报名或课时账户。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ClassGroupEditDialog options={options} classGroup={classGroup} />
          <ClassGroupDeleteForm classGroupId={classGroup.id} />
          <ClassGroupStudentAddDialog classGroupId={classGroup.id} students={students} />
        </div>
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
          <CardTitle>班级信息</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border px-3 py-3">
              <dt className="text-xs text-muted-foreground">课程</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {classGroup.courseProduct.name}
              </dd>
            </div>
            <div className="rounded-md border px-3 py-3">
              <dt className="text-xs text-muted-foreground">科目年级</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {classGroup.courseProduct.subject.name} · {classGroup.courseProduct.grade.name}
              </dd>
            </div>
            <div className="rounded-md border px-3 py-3">
              <dt className="text-xs text-muted-foreground">主讲老师</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {classGroup.primaryTeacher.name}
              </dd>
            </div>
            <div className="rounded-md border px-3 py-3">
              <dt className="text-xs text-muted-foreground">校区</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{classGroup.campus.name}</dd>
            </div>
            <div className="rounded-md border px-3 py-3">
              <dt className="text-xs text-muted-foreground">容量</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {classGroup.students.length}/{classGroup.capacity} 人
              </dd>
            </div>
            <div className="rounded-md border px-3 py-3">
              <dt className="text-xs text-muted-foreground">起止日期</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {formatDate(classGroup.startsAt)} 至 {formatDate(classGroup.endsAt)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {classGroup.students.length > 0 ? (
        <DataTable
          columns={getRosterColumns(classGroup.id)}
          data={classGroup.students}
          getRowKey={(item) => item.id}
        />
      ) : (
        <EmptyState
          title="暂无学生"
          description="添加学生后，老师端即可看到该班级人数和课程信息。"
          action={<ClassGroupStudentAddDialog classGroupId={classGroup.id} students={students} />}
        />
      )}
    </div>
  );
}
