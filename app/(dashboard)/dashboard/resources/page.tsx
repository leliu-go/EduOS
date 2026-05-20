import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ResourceCreateDialog } from "@/features/resources/resource-create-dialog";
import { getResourceLibrary, getResourceLibraryOptions } from "@/features/resources/queries";
import {
  resourceStatusLabels,
  resourceTypeLabels,
  resourceTypeValues,
  type ResourceTypeValue,
} from "@/features/resources/resource-schema";
import { requirePermission } from "@/lib/rbac/require-permission";

type ResourceLibraryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ResourceLibrary = Awaited<ReturnType<typeof getResourceLibrary>>;
type ResourceLibraryItem = ResourceLibrary["items"][number];

function getStringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function getPageParam(value: string | string[] | undefined) {
  const page = typeof value === "string" ? Number(value) : 1;

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getResourceTypeParam(value: string | string[] | undefined): ResourceTypeValue | "" {
  const resourceType = getStringParam(value);

  return resourceTypeValues.includes(resourceType as ResourceTypeValue)
    ? (resourceType as ResourceTypeValue)
    : "";
}

function getResourcesHref({
  query,
  subjectId,
  gradeId,
  resourceType,
  page,
}: {
  query: string;
  subjectId: string;
  gradeId: string;
  resourceType: ResourceTypeValue | "";
  page: number;
}) {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  if (subjectId) {
    searchParams.set("subjectId", subjectId);
  }

  if (gradeId) {
    searchParams.set("gradeId", gradeId);
  }

  if (resourceType) {
    searchParams.set("resourceType", resourceType);
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const queryString = searchParams.toString();

  return queryString ? `/dashboard/resources?${queryString}` : "/dashboard/resources";
}

function getResourceBindingLabel(item: ResourceLibraryItem) {
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

function getResourceColumns(): Array<DataTableColumn<ResourceLibraryItem>> {
  return [
    {
      key: "title",
      header: "资源",
      cell: (item) => (
        <div>
          <p className="font-medium text-foreground">{item.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.fileName ?? item.fileUrl ?? "未填写文件信息"}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "类型",
      cell: (item) => <Badge variant="secondary">{resourceTypeLabels[item.resourceType]}</Badge>,
    },
    {
      key: "binding",
      header: "绑定范围",
      cell: (item) => getResourceBindingLabel(item),
    },
    {
      key: "status",
      header: "状态",
      cell: (item) => <Badge variant="outline">{resourceStatusLabels[item.status]}</Badge>,
    },
  ];
}

export default async function ResourceLibraryPage({ searchParams }: ResourceLibraryPageProps) {
  const currentUser = await requirePermission("resources:manage", {
    nextPath: "/dashboard/resources",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const query = getStringParam(params.q);
  const subjectId = getStringParam(params.subjectId);
  const gradeId = getStringParam(params.gradeId);
  const resourceType = getResourceTypeParam(params.resourceType);
  const page = getPageParam(params.page);
  const [resources, options] = await Promise.all([
    getResourceLibrary(currentUser.tenantId, {
      query,
      subjectId,
      gradeId,
      resourceType,
      page,
    }),
    getResourceLibraryOptions(currentUser.tenantId),
  ]);
  const pageCount = resources.pageCount;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">课程资源</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理课件、讲义、音视频和练习等教学资源元数据，并绑定到课程、班级或课节。
          </p>
        </div>
        <ResourceCreateDialog options={options} returnTo="/dashboard/resources" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>资源库</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
            <Input name="q" defaultValue={query} placeholder="搜索资源名称或文件名" />
            <select
              name="subjectId"
              defaultValue={subjectId}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">全部科目</option>
              {options.subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <select
              name="gradeId"
              defaultValue={gradeId}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">全部年级</option>
              {options.grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
            <select
              name="resourceType"
              defaultValue={resourceType}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">全部类型</option>
              {resourceTypeValues.map((type) => (
                <option key={type} value={type}>
                  {resourceTypeLabels[type]}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              筛选
            </Button>
          </form>

          {resources.items.length > 0 ? (
            <>
              <DataTable
                columns={getResourceColumns()}
                data={resources.items}
                getRowKey={(item) => item.id}
              />
              <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <span>
                  共 {resources.total} 个资源，第 {resources.page} / {pageCount} 页
                </span>
                <div className="flex gap-2">
                  {resources.page <= 1 ? (
                    <Button variant="outline" size="sm" disabled>
                      上一页
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={getResourcesHref({
                          query,
                          subjectId,
                          gradeId,
                          resourceType,
                          page: Math.max(resources.page - 1, 1),
                        })}
                      >
                        上一页
                      </Link>
                    </Button>
                  )}
                  {resources.page >= pageCount ? (
                    <Button variant="outline" size="sm" disabled>
                      下一页
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={getResourcesHref({
                          query,
                          subjectId,
                          gradeId,
                          resourceType,
                          page: Math.min(resources.page + 1, pageCount),
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
            <EmptyState title="暂无课程资源" description="上传资源元数据后，可在这里搜索和筛选。" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
