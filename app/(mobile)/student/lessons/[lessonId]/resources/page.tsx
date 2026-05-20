import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudentLessonResources } from "@/features/resources/queries";
import { resourceTypeLabels } from "@/features/resources/resource-schema";
import { requirePermission } from "@/lib/rbac/require-permission";

type StudentLessonResourcesPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

type StudentLessonResource = Awaited<ReturnType<typeof getStudentLessonResources>>[number];

function StudentLessonResourceCard({ resource }: { resource: StudentLessonResource }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{resource.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {resource.fileName ?? resource.fileUrl ?? resource.lesson?.title ?? "课次资源"}
            </p>
          </div>
          <Badge variant="secondary">{resourceTypeLabels[resource.resourceType]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{resource.lesson?.title ?? "课次资源"}</span>
        <Button asChild variant="outline" size="sm">
          <Link href={`/student/resources/${resource.id}`}>查看</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function StudentLessonResourcesPage({
  params,
}: StudentLessonResourcesPageProps) {
  const currentUser = await requirePermission("route:student", {
    nextPath: "/student",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const { lessonId } = await params;
  const resources = await getStudentLessonResources(currentUser.tenantId, currentUser.id, lessonId);

  if (resources.length === 0) {
    return (
      <EmptyState
        title="暂无开放资源"
        description="老师开放本课次资源后，可在这里查看课件、讲义和练习。"
      />
    );
  }

  return (
    <section className="grid gap-3">
      <h2 className="text-base font-semibold tracking-normal text-foreground">
        {resources[0]?.lesson?.title ?? "课次资源"}
      </h2>
      {resources.map((resource) => (
        <StudentLessonResourceCard key={resource.id} resource={resource} />
      ))}
    </section>
  );
}
