import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { getScheduleCalendarWindow, type ScheduleCalendarSearch } from "./calendar";

const scheduleCalendarInclude = {
  classGroup: {
    include: {
      courseProduct: {
        include: {
          subject: true,
          grade: true,
        },
      },
    },
  },
  teacher: true,
  campus: true,
  room: true,
  lesson: true,
} as const satisfies Prisma.ScheduleInclude;

export type ScheduleCalendarItem = Prisma.ScheduleGetPayload<{
  include: typeof scheduleCalendarInclude;
}>;

function buildScheduleCalendarWhere(tenantId: string, search: ScheduleCalendarSearch) {
  const { startAt, endAt } = getScheduleCalendarWindow(search);
  const where: Prisma.ScheduleWhereInput = {
    tenantId,
    startAt: {
      lt: endAt,
    },
    endAt: {
      gt: startAt,
    },
  };

  if (search.filters.classGroupId) {
    where.classGroupId = search.filters.classGroupId;
  }

  if (search.filters.teacherId) {
    where.teacherId = search.filters.teacherId;
  }

  if (search.filters.campusId) {
    where.campusId = search.filters.campusId;
  }

  if (search.filters.roomId) {
    where.roomId = search.filters.roomId;
  }

  return where;
}

export async function getScheduleCalendarData(tenantId: string, search: ScheduleCalendarSearch) {
  const where = buildScheduleCalendarWhere(tenantId, search);
  const schedules = await prisma.schedule.findMany({
    where,
    include: scheduleCalendarInclude,
    orderBy: [{ startAt: "asc" }, { endAt: "asc" }],
  });
  const campuses = await prisma.campus.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
    },
    orderBy: {
      name: "asc",
    },
  });
  const teachers = await prisma.teacherProfile.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
    },
    orderBy: {
      name: "asc",
    },
  });
  const rooms = await prisma.room.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
    },
    include: {
      campus: true,
    },
    orderBy: [{ campusId: "asc" }, { name: "asc" }],
  });
  const classGroups = await prisma.classGroup.findMany({
    where: {
      tenantId,
      status: {
        in: ["PLANNING", "ACTIVE", "PAUSED"],
      },
    },
    include: {
      courseProduct: true,
    },
    orderBy: [{ startsAt: "desc" }, { name: "asc" }],
  });

  return {
    schedules,
    options: {
      campuses: campuses.map((campus) => ({
        id: campus.id,
        name: campus.name,
      })),
      teachers: teachers.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
      })),
      rooms: rooms.map((room) => ({
        id: room.id,
        name: room.name,
        campus: {
          name: room.campus.name,
        },
      })),
      classGroups: classGroups.map((classGroup) => ({
        id: classGroup.id,
        name: classGroup.name,
        courseProduct: {
          name: classGroup.courseProduct.name,
        },
      })),
    },
    window: getScheduleCalendarWindow(search),
  };
}
