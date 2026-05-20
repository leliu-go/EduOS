import { EmptyState } from "@/components/ui/empty-state";
import { getTeacherTimetable } from "@/features/scheduling/portal-queries";
import { TimetableCard } from "@/features/scheduling/timetable-card";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function TeacherSchedulePage() {
  const currentUser = await requirePermission("route:teacher", {
    nextPath: "/teacher/schedule",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const schedules = await getTeacherTimetable(currentUser.tenantId, currentUser.id);

  if (schedules.length === 0) {
    return (
      <EmptyState
        title="暂无待上课程"
        description="排课完成后，你可以在这里查看班级、校区和教室。"
      />
    );
  }

  return (
    <section className="grid gap-3">
      <h2 className="text-base font-semibold tracking-normal text-foreground">我的课表</h2>
      {schedules.map((schedule) => (
        <TimetableCard
          key={schedule.id}
          title={schedule.lesson?.title ?? schedule.classGroup.name}
          courseName={schedule.classGroup.courseProduct.name}
          startAt={schedule.startAt}
          endAt={schedule.endAt}
          status={schedule.status}
          campusName={schedule.campus.name}
          roomName={schedule.room.name}
          classGroupName={schedule.classGroup.name}
        />
      ))}
    </section>
  );
}
