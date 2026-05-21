import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ResourceCreateDialog } from "@/features/resources/resource-create-dialog";
import { ResourceReleaseDialog } from "@/features/resources/resource-release-dialog";
import { getResourceReleaseLabel } from "@/features/resources/resource-release-label";
import { getResourceLibraryOptions, getTeacherResourceLibrary } from "@/features/resources/queries";
import {
  resourceTypeLabels,
  resourceTypeValues,
  type ResourceTypeValue,
} from "@/features/resources/resource-schema";
import { requirePermission } from "@/lib/rbac/require-permission";

type TeacherResourcePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type TeacherResourceLibrary = Awaited<ReturnType<typeof getTeacherResourceLibrary>>;
type TeacherResourceItem = TeacherResourceLibrary["items"][number];

function getStringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function getResourceTypeParam(value: string | string[] | undefined): ResourceTypeValue | "" {
  const resourceType = getStringParam(value);

  return resourceTypeValues.includes(resourceType as ResourceTypeValue)
    ? (resourceType as ResourceTypeValue)
    : "";
}

function getBindingLabel(item: TeacherResourceItem) {
  if (item.lesson) {
    return `课节：${item.lesson.title}`;
  }

  if (item.classGroup) {
    return `班级：${item.classGroup.name}`;
  }

  if (item.courseProduct) {
    return `课程：${item.courseProduct.name}`;
  }

  return "未绑定";
}

function TeacherResourceCard({ item }: { item: TeacherResourceItem }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{item.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.fileName ?? item.fileUrl ?? "未填写文件信息"}
            </p>
          </div>
          <Badge variant="secondary">{resourceTypeLabels[item.resourceType]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-muted-foreground">
        <p>{getBindingLabel(item)}</p>
        <p>开放时间：{getResourceReleaseLabel(item.releaseAt)}</p>
        <ResourceReleaseDialog
          resource={{
            id: item.id,
            title: item.title,
            releaseAt: item.releaseAt?.toISOString() ?? null,
          }}
          returnTo="/teacher/resources"
        />
      </CardContent>
    </Card>
  );
}

export default async function TeacherResourceLibraryPage({
  searchParams,
}: TeacherResourcePageProps) {
  const currentUser = await requirePermission("resources:manage", {
    nextPath: "/teacher/resources",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const query = getStringParam(params.q);
  const subjectId = getStringParam(params.subjectId);
  const gradeId = getStringParam(params.gradeId);
  const resourceType = getResourceTypeParam(params.resourceType);
  const [resources, options] = await Promise.all([
    getTeacherResourceLibrary(currentUser.tenantId, currentUser.id, {
      query,
      subjectId,
      gradeId,
      resourceType,
      pageSize: 20,
    }),
    getResourceLibraryOptions(currentUser.tenantId, { teacherUserId: currentUser.id }),
  ]);

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-normal text-foreground">课程资源</h2>
          <p className="mt-1 text-sm text-muted-foreground">上传并检索自己授课相关的资源元数据。</p>
        </div>
        <ResourceCreateDialog options={options} returnTo="/teacher/resources" />
      </div>

      <form className="grid gap-3">
        <Input name="q" defaultValue={query} placeholder="搜索资源名称或文件名" />
        <div className="grid grid-cols-3 gap-2">
          <select
            name="subjectId"
            defaultValue={subjectId}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs outline-none"
          >
            <option value="">科目</option>
            {options.subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <select
            name="gradeId"
            defaultValue={gradeId}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs outline-none"
          >
            <option value="">年级</option>
            {options.grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
          <select
            name="resourceType"
            defaultValue={resourceType}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs outline-none"
          >
            <option value="">类型</option>
            {resourceTypeValues.map((type) => (
              <option key={type} value={type}>
                {resourceTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="outline">
          筛选
        </Button>
      </form>

      {resources.items.length > 0 ? (
        resources.items.map((item) => <TeacherResourceCard key={item.id} item={item} />)
      ) : (
        <EmptyState
          title="暂无课程资源"
          description="上传资源元数据后，可在这里查看自己的教学资源。"
        />
      )}
    </div>
  );
}
