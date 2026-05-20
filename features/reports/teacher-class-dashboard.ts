import { getTeacherAttendanceSchedules } from "@/features/attendance/queries";
import { getTeacherHomeworkSubmissionsForCorrection } from "@/features/homework/queries";
import { getTeacherClassWeaknessStats } from "@/features/mistakes/queries";
import { getTeacherErrorRecordScope } from "@/features/mistakes/scopes";
import type { ScheduleStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const todayLessonStatuses: ScheduleStatus[] = ["SCHEDULED", "RESCHEDULED", "MAKE_UP"];
const teacherDashboardTodayLessonTake = 8;
const teacherDashboardAttentionStudentTake = 5;

export function getTeacherDashboardDateRange(today = new Date()) {
  const startAt = new Date(today);
  const endAt = new Date(today);

  startAt.setHours(0, 0, 0, 0);
  endAt.setHours(23, 59, 59, 999);

  return { startAt, endAt };
}

export async function getTeacherAttentionStudents(tenantId: string, teacherUserId: string) {
  const rows = await prisma.errorRecord.groupBy({
    by: ["studentId"],
    where: {
      ...getTeacherErrorRecordScope(tenantId, teacherUserId),
      status: {
        in: ["PENDING_CORRECTION", "CORRECTED"],
      },
      student: {
        status: "ACTIVE",
      },
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        studentId: "desc",
      },
    },
    take: teacherDashboardAttentionStudentTake,
  });

  if (rows.length === 0) {
    return [];
  }

  const students = await prisma.studentProfile.findMany({
    where: {
      tenantId,
      id: {
        in: rows.map((row) => row.studentId),
      },
    },
    select: {
      id: true,
      name: true,
      grade: true,
      school: true,
    },
  });
  const studentById = new Map(students.map((student) => [student.id, student]));

  return rows.flatMap((row) => {
    const student = studentById.get(row.studentId);

    if (!student) {
      return [];
    }

    return [
      {
        ...student,
        attentionCount: row._count._all,
      },
    ];
  });
}

export async function getTeacherClassDashboard(
  tenantId: string,
  teacherUserId: string,
  today = new Date(),
) {
  const range = getTeacherDashboardDateRange(today);

  const [todayLessons, pendingAttendance, pendingCorrections, classWeakness, attentionStudents] =
    await Promise.all([
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
      getTeacherAttentionStudents(tenantId, teacherUserId),
    ]);

  return {
    todayLessons,
    pendingAttendance,
    pendingCorrections,
    classWeakness,
    attentionStudents,
  };
}
