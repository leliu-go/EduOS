import { prisma } from "@/lib/prisma";

const attendanceScheduleStatuses = ["SCHEDULED", "RESCHEDULED", "MAKE_UP"] as const;
const studentCheckInScheduleTake = 6;
const teacherAttendanceScheduleTake = 8;
const parentAttendanceRecordTake = 20;

function startOfDay(value: Date) {
  const date = new Date(value);

  date.setHours(0, 0, 0, 0);

  return date;
}

function endOfDay(value: Date) {
  const date = new Date(value);

  date.setHours(23, 59, 59, 999);

  return date;
}

export async function getStudentCheckInSchedules(
  tenantId: string,
  userId: string,
  today = new Date(),
) {
  return prisma.schedule.findMany({
    where: {
      tenantId,
      status: {
        in: [...attendanceScheduleStatuses],
      },
      startAt: {
        gte: startOfDay(today),
        lte: endOfDay(today),
      },
      classGroup: {
        students: {
          some: {
            student: {
              userId,
            },
          },
        },
      },
    },
    include: {
      lesson: true,
      classGroup: {
        include: {
          courseProduct: true,
        },
      },
      teacher: true,
      campus: true,
      checkIns: {
        where: {
          student: {
            userId,
          },
        },
        take: 1,
      },
    },
    orderBy: [{ startAt: "asc" }, { endAt: "asc" }],
    take: studentCheckInScheduleTake,
  });
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
      checkIns: true,
    },
    orderBy: [{ startAt: "asc" }, { endAt: "asc" }],
    take: teacherAttendanceScheduleTake,
  });
}

export async function getParentAttendanceRecords(
  tenantId: string,
  userId: string,
  options: { limit?: number } = {},
) {
  return prisma.attendance.findMany({
    where: {
      tenantId,
      student: {
        guardians: {
          some: {
            guardian: {
              tenantId,
              userId,
            },
          },
        },
      },
    },
    include: {
      student: true,
      schedule: {
        include: {
          lesson: true,
          classGroup: {
            include: {
              courseProduct: true,
            },
          },
          campus: true,
          teacher: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
    take: options.limit ?? parentAttendanceRecordTake,
  });
}
