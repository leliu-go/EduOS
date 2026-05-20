import { getTeacherAttendanceSchedules } from "@/features/attendance/queries";
import { getTeacherHomeworkSubmissionsForCorrection } from "@/features/homework/queries";
import { getTeacherClassWeaknessStats } from "@/features/mistakes/queries";
import type { ScheduleStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const todayLessonStatuses: ScheduleStatus[] = ["SCHEDULED", "RESCHEDULED", "MAKE_UP"];
const teacherDashboardTodayLessonTake = 8;

export function getTeacherDashboardDateRange(today = new Date()) {
  const startAt = new Date(today);
  const endAt = new Date(today);

  startAt.setHours(0, 0, 0, 0);
  endAt.setHours(23, 59, 59, 999);

  return { startAt, endAt };
}

export async function getTeacherClassDashboard(
  tenantId: string,
  teacherUserId: string,
  today = new Date(),
) {
  const range = getTeacherDashboardDateRange(today);

  const [todayLessons, pendingAttendance, pendingCorrections, classWeakness] = await Promise.all([
    prisma.schedule.findMany({
      where: {
        tenantId,
        status: {
          in: todayLessonStatuses,
        },
        startAt: {
          gte: range.startAt,
          lte: range.endAt,
        },
        teacher: {
          userId: teacherUserId,
        },
      },
      include: {
        lesson: true,
        classGroup: {
          include: {
            courseProduct: true,
          },
        },
        campus: true,
        room: true,
      },
      orderBy: [{ startAt: "asc" }, { endAt: "asc" }],
      take: teacherDashboardTodayLessonTake,
    }),
    getTeacherAttendanceSchedules(tenantId, teacherUserId, today),
    getTeacherHomeworkSubmissionsForCorrection(tenantId, teacherUserId),
    getTeacherClassWeaknessStats(tenantId, teacherUserId),
  ]);

  return {
    todayLessons,
    pendingAttendance,
    pendingCorrections,
    classWeakness,
  };
}
