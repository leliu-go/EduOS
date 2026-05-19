import { CalendarDays, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { classGroupStatusLabels } from "@/features/classes/class-group-schema";
import { getTeacherClassGroups } from "@/features/classes/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export default async function TeacherClassesPage() {
  const currentUser = await requirePermission("route:teacher", {
    nextPath: "/teacher/classes",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const classGroups = await getTeacherClassGroups(currentUser.tenantId, currentUser.id);

  if (classGroups.length === 0) {
    return <EmptyState title="暂无班级" description="当前账号暂未绑定主讲班级。" />;
  }

  return (
    <div className="grid gap-4">
      {classGroups.map((classGroup) => (
        <Card key={classGroup.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{classGroup.name}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {classGroup.courseProduct.subject.name} · {classGroup.courseProduct.grade.name}
                </p>
              </div>
              <Badge variant="secondary">{classGroupStatusLabels[classGroup.status]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Users className="size-4" aria-hidden="true" />
              {classGroup._count.students}/{classGroup.capacity} 人
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden="true" />
              {classGroup.campus.name}
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatDate(classGroup.startsAt)} 至 {formatDate(classGroup.endsAt)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
