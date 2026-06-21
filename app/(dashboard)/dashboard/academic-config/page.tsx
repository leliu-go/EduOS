import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  GradeCreateDialog,
  GradeDeleteForm,
  GradeEditDialog,
  SubjectCreateDialog,
  SubjectDeleteForm,
  SubjectEditDialog,
  TermCreateDialog,
  TermDeleteForm,
  TermEditDialog,
} from "@/features/academic-config/config-dialogs";
import { configStatusLabels, formatConfigDate } from "@/features/academic-config/config-schema";
import { getAcademicConfig } from "@/features/academic-config/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

type ConfigPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ConfigData = Awaited<ReturnType<typeof getAcademicConfig>>;
type SubjectItem = ConfigData["subjects"][number];
type GradeItem = ConfigData["grades"][number];
type TermItem = ConfigData["terms"][number];
type ConfigRow = { id: string };

const errorMessages = {
  invalid_subject: "科目信息不完整，请检查后重试。",
  invalid_grade: "年级信息不完整，请检查后重试。",
  invalid_term: "学期信息不完整，请检查后重试。",
  not_found: "未找到对应教务规则。",
} as const;

function statusBadge(status: "ACTIVE" | "INACTIVE") {
  return <Badge variant="secondary">{configStatusLabels[status]}</Badge>;
}

const subjectColumns: Array<DataTableColumn<SubjectItem>> = [
  { key: "name", header: "科目", cell: (subject) => subject.name },
  { key: "code", header: "编码", cell: (subject) => subject.code ?? "未填写" },
  { key: "status", header: "状态", cell: (subject) => statusBadge(subject.status) },
  {
    key: "actions",
    header: "操作",
    className: "text-right",
    cell: (subject) => (
      <div className="flex justify-end gap-2">
        <SubjectEditDialog subject={subject} />
        <SubjectDeleteForm subjectId={subject.id} />
      </div>
    ),
  },
];

const gradeColumns: Array<DataTableColumn<GradeItem>> = [
  { key: "name", header: "年级", cell: (grade) => grade.name },
  { key: "sortOrder", header: "排序", cell: (grade) => grade.sortOrder },
  { key: "status", header: "状态", cell: (grade) => statusBadge(grade.status) },
  {
    key: "actions",
    header: "操作",
    className: "text-right",
    cell: (grade) => (
      <div className="flex justify-end gap-2">
        <GradeEditDialog grade={grade} />
        <GradeDeleteForm gradeId={grade.id} />
      </div>
    ),
  },
];

const termColumns: Array<DataTableColumn<TermItem>> = [
  { key: "name", header: "学期", cell: (term) => term.name },
  {
    key: "range",
    header: "日期范围",
    cell: (term) => `${formatConfigDate(term.startsAt)} 至 ${formatConfigDate(term.endsAt)}`,
  },
  { key: "status", header: "状态", cell: (term) => statusBadge(term.status) },
  {
    key: "actions",
    header: "操作",
    className: "text-right",
    cell: (term) => (
      <div className="flex justify-end gap-2">
        <TermEditDialog
          term={{
            ...term,
            startsAt: formatConfigDate(term.startsAt),
            endsAt: formatConfigDate(term.endsAt),
          }}
        />
        <TermDeleteForm termId={term.id} />
      </div>
    ),
  },
];

function ConfigSection<TItem extends ConfigRow>({
  title,
  action,
  columns,
  data,
  emptyTitle,
}: {
  title: string;
  action: ReactNode;
  columns: Array<DataTableColumn<TItem>>;
  data: TItem[];
  emptyTitle: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          {action}
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <DataTable columns={columns} data={data} getRowKey={(item) => item.id} />
        ) : (
          <EmptyState
            title={emptyTitle}
            description="新增后可在课程、班级、排课和报表中使用。"
            action={action}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default async function AcademicConfigPage({ searchParams }: ConfigPageProps) {
  const currentUser = await requirePermission("academicConfig:manage", {
    nextPath: "/dashboard/academic-config",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const config = await getAcademicConfig(currentUser.tenantId);
  const errorMessage =
    typeof params.error === "string"
      ? errorMessages[params.error as keyof typeof errorMessages]
      : null;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">教务规则</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          配置科目、年级和学期，作为课程产品、班级、排课和报表的统一基础数据。
        </p>
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      <ConfigSection
        title="科目"
        action={<SubjectCreateDialog />}
        columns={subjectColumns}
        data={config.subjects}
        emptyTitle="暂无科目"
      />
      <ConfigSection
        title="年级"
        action={<GradeCreateDialog />}
        columns={gradeColumns}
        data={config.grades}
        emptyTitle="暂无年级"
      />
      <ConfigSection
        title="学期"
        action={<TermCreateDialog />}
        columns={termColumns}
        data={config.terms}
        emptyTitle="暂无学期"
      />
    </div>
  );
}
