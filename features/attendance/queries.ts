import { prisma } from "@/lib/prisma";

const attendanceScheduleStatuses = ["SCHEDULED", "RESCHEDULED", "MAKE_UP"] as const;
const teacherAttendanceScheduleTake = 8;

function startOfDay(value: Date) {
  const date = new Date(value);

  date.setHours(0, 0, 0, 0);

  return date;
}

export async function getTeacherAttendanceSchedules(
  tenantId: string,
  userId: string,
  from = new Date(),
) {
  return prisma.schedule.findMany({
    where: {
      tenantId,
      status: {
        in: [...attendanceScheduleStatuses],
      },
      endAt: {
        gte: startOfDay(from),
      },
      teacher: {
        userId,
      },
    },
    include: {
      lesson: true,
      classGroup: {
        include: {
          courseProduct: true,
          students: {
            include: {
              student: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
      campus: true,
      room: true,
      attendances: true,
    },
    orderBy: [{ startAt: "asc" }, { endAt: "asc" }],
    take: teacherAttendanceScheduleTake,
  });
}
