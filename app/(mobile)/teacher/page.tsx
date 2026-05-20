import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AttendanceRosterForm } from "@/features/attendance/attendance-roster-form";
import { getTeacherAttendanceSchedules } from "@/features/attendance/queries";
import { getTeacherTimetable } from "@/features/scheduling/portal-queries";
import { TimetableCard } from "@/features/scheduling/timetable-card";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function TeacherHomePage() {
  const currentUser = await requirePermission("route:teacher", {
    nextPath: "/teacher",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const [timetable, attendanceSchedules] = await Promise.all([
    getTeacherTimetable(currentUser.tenantId, currentUser.id),
    getTeacherAttendanceSchedules(currentUser.tenantId, currentUser.id),
  ]);

  if (timetable.length === 0 && attendanceSchedules.length === 0) {
    return <EmptyState title="暂无授课任务" description="排课完成后，可在这里查看近期授课安排。" />;
  }

  return (
    <div className="grid gap-4">
      {timetable.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-base font-semibold tracking-normal text-foreground">近期课表</h2>
          {timetable.map((schedule) => (
            <div key={schedule.id} className="grid gap-2">
              <TimetableCard
                title={schedule.lesson?.title ?? schedule.classGroup.name}
                courseName={schedule.classGroup.courseProduct.name}
                startAt={schedule.startAt}
                endAt={schedule.endAt}
                status={schedule.status}
                campusName={schedule.campus.name}
                roomName={schedule.room.name}
                classGroupName={schedule.classGroup.name}
              />
              {schedule.lesson?.id ? (
                <Button asChild variant="outline" size="sm" className="justify-self-start">
                  <Link href={`/teacher/lessons/${schedule.lesson.id}`}>课次资源</Link>
                </Button>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {attendanceSchedules.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-base font-semibold tracking-normal text-foreground">待点名课程</h2>
          {attendanceSchedules.map((schedule) => (
            <AttendanceRosterForm key={schedule.id} schedule={schedule} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
