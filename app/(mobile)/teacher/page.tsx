import { EmptyState } from "@/components/ui/empty-state";
import { getTeacherTimetable } from "@/features/scheduling/portal-queries";
import { TimetableCard } from "@/features/scheduling/timetable-card";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function TeacherHomePage() {
  const currentUser = await requirePermission("route:teacher", {
    nextPath: "/teacher",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const timetable = await getTeacherTimetable(currentUser.tenantId, currentUser.id);

  if (timetable.length === 0) {
    return <EmptyState title="暂无授课任务" description="排课完成后，可在这里查看近期授课安排。" />;
  }

  return (
    <div className="grid gap-4">
      {timetable.map((schedule) => (
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
    </div>
  );
}
