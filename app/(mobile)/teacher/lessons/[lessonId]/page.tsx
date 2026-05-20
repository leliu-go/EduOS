import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LessonFeedbackForm } from "@/features/lesson-feedback/lesson-feedback-form";
import { getTeacherLessonFeedbackContext } from "@/features/lesson-feedback/queries";
import { ResourceCreateDialog } from "@/features/resources/resource-create-dialog";
import {
  getResourceReleaseLabel,
  ResourceReleaseDialog,
} from "@/features/resources/resource-release-dialog";
import { getResourceLibraryOptions, getTeacherLessonResources } from "@/features/resources/queries";
import { resourceTypeLabels } from "@/features/resources/resource-schema";
import { requirePermission } from "@/lib/rbac/require-permission";

type TeacherLessonResourcesPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

type TeacherLessonResource = Awaited<ReturnType<typeof getTeacherLessonResources>>[number];

function TeacherLessonResourceCard({
  resource,
  lessonId,
}: {
  resource: TeacherLessonResource;
  lessonId: string;
}) {
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
      <CardContent className="grid gap-3 text-sm text-muted-foreground">
        {resource.description ? <p>{resource.description}</p> : null}
        <p>开放时间：{getResourceReleaseLabel(resource.releaseAt)}</p>
        {resource.fileUrl ? (
          <Button asChild variant="outline" size="sm" className="justify-self-start">
            <a href={resource.fileUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" aria-hidden="true" />
              打开资源
            </a>
          </Button>
        ) : null}
        <ResourceReleaseDialog resource={resource} returnTo={`/teacher/lessons/${lessonId}`} />
      </CardContent>
    </Card>
  );
}

export default async function TeacherLessonResourcesPage({
  params,
}: TeacherLessonResourcesPageProps) {
  const currentUser = await requirePermission("resources:manage", {
    nextPath: "/teacher",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const { lessonId } = await params;
  const [lesson, resources, options] = await Promise.all([
    getTeacherLessonFeedbackContext(currentUser.tenantId, currentUser.id, lessonId),
    getTeacherLessonResources(currentUser.tenantId, currentUser.id, lessonId),
    getResourceLibraryOptions(currentUser.tenantId, { teacherUserId: currentUser.id }),
  ]);

  if (!lesson) {
    return <EmptyState title="未找到课次" description="只能查看和绑定自己授课课次的资源。" />;
  }
  const dialogOptions = options.lessons.some((item) => item.id === lesson.id)
    ? options
    : {
        ...options,
        lessons: [lesson, ...options.lessons],
      };

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-normal text-foreground">
            {lesson.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{lesson.classGroup.name}</p>
        </div>
        <ResourceCreateDialog
          options={dialogOptions}
          returnTo={`/teacher/lessons/${lessonId}`}
          defaultLessonId={lessonId}
        />
      </div>

      <section className="grid gap-3">
        <h3 className="text-sm font-semibold tracking-normal text-foreground">课后反馈</h3>
        {lesson.students.length > 0 ? (
          lesson.students.map((student) => (
            <LessonFeedbackForm
              key={student.id}
              lessonId={lesson.id}
              returnTo={`/teacher/lessons/${lessonId}`}
              student={student}
            />
          ))
        ) : (
          <EmptyState title="暂无学生" description="班级添加学生后，可为本课次填写课后反馈。" />
        )}
      </section>

      {resources.length > 0 ? (
        resources.map((resource) => (
          <TeacherLessonResourceCard key={resource.id} resource={resource} lessonId={lessonId} />
        ))
      ) : (
        <EmptyState
          title="暂无课次资源"
          description="可将课件、讲义、练习或解析绑定到本课次，学生仅能看到已开放的资源。"
        />
      )}
    </div>
  );
}
