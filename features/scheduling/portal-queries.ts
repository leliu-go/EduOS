import type { Prisma, ScheduleStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const activeScheduleStatuses: ScheduleStatus[] = ["SCHEDULED", "RESCHEDULED", "MAKE_UP"];
const portalScheduleTake = 10;

function getUpcomingWhere(tenantId: string, from = new Date()): Prisma.ScheduleWhereInput {
  return {
    tenantId,
    status: {
      in: activeScheduleStatuses,
    },
    startAt: {
      gte: from,
    },
  };
}

export async function getStudentTimetable(tenantId: string, userId: string, from = new Date()) {
  return prisma.schedule.findMany({
    where: {
      ...getUpcomingWhere(tenantId, from),
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
    },
    orderBy: [{ startAt: "asc" }, { endAt: "asc" }],
    take: portalScheduleTake,
  });
}

export async function getTeacherTimetable(tenantId: string, userId: string, from = new Date()) {
  return prisma.schedule.findMany({
    where: {
      ...getUpcomingWhere(tenantId, from),
      teacher: {
        userId,
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
    take: portalScheduleTake,
  });
}

export async function getParentTimetable(tenantId: string, userId: string, from = new Date()) {
  return prisma.schedule.findMany({
    where: {
      ...getUpcomingWhere(tenantId, from),
      classGroup: {
        students: {
          some: {
            student: {
              guardians: {
                some: {
                  guardian: {
                    userId,
                  },
                },
              },
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
          students: {
            where: {
              student: {
                guardians: {
                  some: {
                    guardian: {
                      userId,
                    },
                  },
                },
              },
            },
            include: {
              student: true,
            },
          },
        },
      },
      teacher: true,
      campus: true,
    },
    orderBy: [{ startAt: "asc" }, { endAt: "asc" }],
    take: portalScheduleTake,
  });
}
