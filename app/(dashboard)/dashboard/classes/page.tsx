import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ClassGroupCreateDialog } from "@/features/classes/class-group-form-dialog";
import { classGroupStatusLabels } from "@/features/classes/class-group-schema";
import { getClassGroupFormOptions, getClassGroupList } from "@/features/classes/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

type ClassGroupListPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages = {
  invalid_input: "班级信息不完整，请检查后重试。",
  invalid_config: "请选择当前机构下有效的课程、老师和校区。",
  invalid_student: "学生信息不完整，请检查后重试。",
  not_found: "未找到对应班级或学生。",
} as const;

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export default async function ClassGroupListPage({ searchParams }: ClassGroupListPageProps) {
  const currentUser = await requirePermission("classes:manage", {
    nextPath: "/dashboard/classes",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const [classGroups, options] = await Promise.all([
    getClassGroupList(currentUser.tenantId),
    getClassGroupFormOptions(currentUser.tenantId),
  ]);
  const errorMessage =
    typeof params.error === "string"
      ? errorMessages[params.error as keyof typeof errorMessages]
      : null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">班级</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理实际教学班级、主讲老师、校区、容量和学生花名册。
          </p>
        </div>
        <ClassGroupCreateDialog options={options} />
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      {classGroups.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classGroups.map((classGroup) => (
            <Card key={classGroup.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{classGroup.name}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {classGroup.courseProduct.name}
                    </p>
                  </div>
                  <Badge variant="secondary">{classGroupStatusLabels[classGroup.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Users className="size-4" aria-hidden="true" />
                    {classGroup.primaryTeacher.name} · {classGroup._count.students}/
                    {classGroup.capacity} 人
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4" aria-hidden="true" />
                    {classGroup.campus.name}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    {formatDate(classGroup.startsAt)} 至 {formatDate(classGroup.endsAt)}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/classes/${classGroup.id}`}>管理班级</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="暂无班级"
          description="创建班级前，请先准备课程产品、老师和校区。"
          action={<ClassGroupCreateDialog options={options} />}
        />
      )}
    </div>
  );
}
