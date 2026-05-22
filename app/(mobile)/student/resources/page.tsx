import Link from "next/link";

import { SectionHeader } from "@/components/mobile/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudentVisibleResources } from "@/features/resources/queries";
import { resourceTypeLabels } from "@/features/resources/resource-schema";
import { requirePermission } from "@/lib/rbac/require-permission";

type StudentResource = Awaited<ReturnType<typeof getStudentVisibleResources>>[number];

function getBindingLabel(resource: StudentResource) {
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

function StudentResourceCard({ resource }: { resource: StudentResource }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{resource.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {resource.fileName ?? resource.fileUrl ?? getBindingLabel(resource)}
            </p>
          </div>
          <Badge variant="secondary">{resourceTypeLabels[resource.resourceType]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{getBindingLabel(resource)}</span>
        <Button asChild variant="outline" size="sm">
          <Link href={`/student/resources/${resource.id}`}>查看</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function StudentResourcesPage() {
  const currentUser = await requirePermission("route:student", {
    nextPath: "/student/resources",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const resources = await getStudentVisibleResources(currentUser.tenantId, currentUser.id);

  if (resources.length === 0) {
    return (
      <EmptyState
        title="暂无学习资源"
        description="老师开放资源后，可在这里查看课件、讲义和练习。"
      />
    );
  }

  return (
    <section className="grid gap-3">
      <SectionHeader
        title="学习资源"
        description="只展示老师或机构授权给你的资源，下载前仍会走服务端权限校验。"
        badge={`${resources.length} 个`}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {resources.map((resource) => (
          <StudentResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </section>
  );
}
