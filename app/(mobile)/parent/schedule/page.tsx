import { EmptyState } from "@/components/ui/empty-state";
import { getParentTimetable } from "@/features/scheduling/portal-queries";
import { TimetableCard } from "@/features/scheduling/timetable-card";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function ParentSchedulePage() {
  const currentUser = await requirePermission("route:parent", {
    nextPath: "/parent/schedule",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const schedules = await getParentTimetable(currentUser.tenantId, currentUser.id);

  if (schedules.length === 0) {
    return (
      <EmptyState
        title="暂无孩子课表"
        description="孩子有新的排课后，你可以在这里查看上课时间、课程和老师。"
      />
    );
  }

  return (
    <section className="grid gap-3">
      <h2 className="text-base font-semibold tracking-normal text-foreground">孩子课表</h2>
      {schedules.map((schedule) => {
        const studentNames = schedule.classGroup.students
          .map((classGroupStudent) => classGroupStudent.student.name)
          .join("、");

        return (
          <TimetableCard
            key={schedule.id}
            title={schedule.lesson?.title ?? schedule.classGroup.name}
            courseName={schedule.classGroup.courseProduct.name}
            startAt={schedule.startAt}
            endAt={schedule.endAt}
            status={schedule.status}
            campusName={schedule.campus.name}
            classGroupName={schedule.classGroup.name}
            teacherName={schedule.teacher.name}
            studentNames={studentNames}
          />
        );
      })}
    </section>
  );
}
