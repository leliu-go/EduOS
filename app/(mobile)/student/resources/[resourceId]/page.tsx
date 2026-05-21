import { ExternalLink } from "lucide-react";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentResourceDetail } from "@/features/resources/queries";
import { resourceTypeLabels } from "@/features/resources/resource-schema";
import { requirePermission } from "@/lib/rbac/require-permission";

type StudentResourceDetailPageProps = {
  params: Promise<{
    resourceId: string;
  }>;
};

type StudentResourceDetail = NonNullable<Awaited<ReturnType<typeof getStudentResourceDetail>>>;

function getBindingLabel(resource: StudentResourceDetail) {
  if (resource.lesson) {
    return `课节：${resource.lesson.title}`;
  }

  if (resource.classGroup) {
    return `班级：${resource.classGroup.name}`;
  }

  if (resource.courseProduct) {
    return `课程：${resource.courseProduct.name}`;
  }

  return "学习资源";
}

export default async function StudentResourceDetailPage({
  params,
}: StudentResourceDetailPageProps) {
  const currentUser = await requirePermission("route:student", {
    nextPath: "/student/resources",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const { resourceId } = await params;
  const resource = await getStudentResourceDetail(currentUser.tenantId, currentUser.id, resourceId);

  if (!resource) {
    redirect("/unauthorized");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{resource.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{getBindingLabel(resource)}</p>
          </div>
          <Badge variant="secondary">{resourceTypeLabels[resource.resourceType]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm text-muted-foreground">
        {resource.description ? <p>{resource.description}</p> : null}
        <div className="rounded-md border px-3 py-3">
          <p className="text-xs text-muted-foreground">文件信息</p>
          <p className="mt-1 font-medium text-foreground">
            {resource.fileName ?? resource.fileUrl ?? "老师暂未填写文件信息"}
          </p>
        </div>
        {resource.objectKey ? (
          <Button asChild>
            <a href={`/student/resources/${resource.id}/download`}>
              <ExternalLink className="size-4" aria-hidden="true" />
              验权后打开资源
            </a>
          </Button>
        ) : resource.fileUrl ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-amber-800">
            该资源仍是旧版文件地址，已停止在学生端直接暴露。请联系老师重新上传到资源存储。
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
