import { SectionHeader } from "@/components/mobile/SectionHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudentTimetable } from "@/features/scheduling/portal-queries";
import { TimetableCard } from "@/features/scheduling/timetable-card";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function StudentSchedulePage() {
  const currentUser = await requirePermission("route:student", {
    nextPath: "/student/schedule",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const schedules = await getStudentTimetable(currentUser.tenantId, currentUser.id);

  if (schedules.length === 0) {
    return (
      <EmptyState
        title="暂无课表"
        description="有新的排课后，你可以在这里查看上课时间、班级和授课老师。"
      />
    );
  }

  return (
    <section className="grid gap-3">
      <SectionHeader
        title="我的课表"
        description="这里只显示你的课程、授课老师和班级信息，不展示机构内部教室占用。"
        badge={`${schedules.length} 节`}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {schedules.map((schedule) => (
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
          />
        ))}
      </div>
    </section>
  );
}
