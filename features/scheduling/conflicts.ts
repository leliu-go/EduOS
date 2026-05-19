import type { Prisma } from "@/lib/generated/prisma/client";

import type { WeeklyScheduleOccurrence } from "./recurring";

export type BasicScheduleConflictInput = {
  classGroupId: string;
  teacherId: string;
  roomId: string;
};

export type BasicScheduleConflict = {
  type: "teacher" | "room" | "classGroup";
  scheduleId: string;
  startAt: Date;
  endAt: Date;
};

type ScheduleConflictClient = {
  schedule: {
    findMany(args: {
      where: Prisma.ScheduleWhereInput;
      select: {
        id: true;
        classGroupId: true;
        teacherId: true;
        roomId: true;
        startAt: true;
        endAt: true;
      };
    }): Promise<
      Array<{
        id: string;
        classGroupId: string;
        teacherId: string;
        roomId: string;
        startAt: Date;
        endAt: Date;
      }>
    >;
  };
};

export async function findBasicScheduleConflicts(
  tx: ScheduleConflictClient,
  tenantId: string,
  input: BasicScheduleConflictInput,
  occurrences: WeeklyScheduleOccurrence[],
) {
  if (occurrences.length === 0) {
    return [];
  }

  const schedules = await tx.schedule.findMany({
    where: {
      tenantId,
      status: {
        in: ["SCHEDULED", "RESCHEDULED", "MAKE_UP"],
      },
      AND: [
        {
          OR: occurrences.map((occurrence) => ({
            startAt: {
              lt: occurrence.endAt,
            },
            endAt: {
              gt: occurrence.startAt,
            },
          })),
        },
        {
          OR: [
            { teacherId: input.teacherId },
            { roomId: input.roomId },
            { classGroupId: input.classGroupId },
          ],
        },
      ],
    },
    select: {
      id: true,
      classGroupId: true,
      teacherId: true,
      roomId: true,
      startAt: true,
      endAt: true,
    },
  });

  return schedules.flatMap((schedule): BasicScheduleConflict[] => {
    const conflicts: BasicScheduleConflict[] = [];

    if (schedule.teacherId === input.teacherId) {
      conflicts.push({
        type: "teacher",
        scheduleId: schedule.id,
        startAt: schedule.startAt,
        endAt: schedule.endAt,
      });
    }

    if (schedule.roomId === input.roomId) {
      conflicts.push({
        type: "room",
        scheduleId: schedule.id,
        startAt: schedule.startAt,
        endAt: schedule.endAt,
      });
    }

    if (schedule.classGroupId === input.classGroupId) {
      conflicts.push({
        type: "classGroup",
        scheduleId: schedule.id,
        startAt: schedule.startAt,
        endAt: schedule.endAt,
      });
    }

    return conflicts;
  });
}
