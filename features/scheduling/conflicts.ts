import type { Prisma } from "@/lib/generated/prisma/client";

import type { WeeklyScheduleOccurrence } from "./recurring";

export type ScheduleConflictType =
  | "teacher_time"
  | "room_time"
  | "student_time"
  | "campus_business_hours"
  | "class_group_duplicate";

export type ScheduleConflictCandidate = {
  classGroupId: string;
  teacherId: string;
  roomId: string;
  campusId: string;
  startAt: Date;
  endAt: Date;
};

export type ScheduleConflict = {
  type: ScheduleConflictType;
  message: string;
  scheduleId?: string;
  startAt: Date;
  endAt: Date;
};

export type ScheduleConflictOptions = {
  excludeScheduleIds?: string[];
};

export type BasicScheduleConflictInput = {
  classGroupId: string;
  teacherId: string;
  roomId: string;
  campusId?: string;
};

type ScheduleConflictClient = {
  classGroupStudent: {
    findMany(args: {
      where: Prisma.ClassGroupStudentWhereInput;
      select: {
        classGroupId: true;
        studentId: true;
      };
    }): Promise<Array<{ classGroupId: string; studentId: string }>>;
  };
  campus: {
    findMany(args: {
      where: Prisma.CampusWhereInput;
      select: {
        id: true;
        name: true;
        businessHours: true;
      };
    }): Promise<Array<{ id: string; name: string; businessHours: string | null }>>;
  };
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
        teacher: {
          select: {
            name: true;
          };
        };
        room: {
          select: {
            name: true;
            campus: {
              select: {
                name: true;
              };
            };
          };
        };
        classGroup: {
          select: {
            name: true;
            students: {
              select: {
                studentId: true;
              };
            };
          };
        };
      };
    }): Promise<
      Array<{
        id: string;
        classGroupId: string;
        teacherId: string;
        roomId: string;
        startAt: Date;
        endAt: Date;
        teacher: { name: string };
        room: { name: string; campus: { name: string } };
        classGroup: { name: string; students: Array<{ studentId: string }> };
      }>
    >;
  };
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function formatDateTime(value: Date) {
  return `${value.toISOString().slice(0, 10)} ${value.toISOString().slice(11, 16)}`;
}

function formatRange(startAt: Date, endAt: Date) {
  return `${formatDateTime(startAt)}-${endAt.toISOString().slice(11, 16)}`;
}

function overlaps(left: { startAt: Date; endAt: Date }, right: { startAt: Date; endAt: Date }) {
  return left.startAt < right.endAt && left.endAt > right.startAt;
}

function parseTimeMinutes(value: string) {
  const [hour, minute] = value.split(":").map((entry) => Number.parseInt(entry, 10));

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
}

function parseBusinessHours(value: string | null) {
  const match = value?.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);

  if (!match) {
    return null;
  }

  const startMinutes = parseTimeMinutes(match[1]);
  const endMinutes = parseTimeMinutes(match[2]);

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return null;
  }

  return {
    label: `${match[1]}-${match[2]}`,
    startMinutes,
    endMinutes,
  };
}

function minutesOfUtcDay(value: Date) {
  return value.getUTCHours() * 60 + value.getUTCMinutes();
}

function getBusinessHourConflict(
  candidate: ScheduleConflictCandidate,
  campus: { name: string; businessHours: string | null } | undefined,
) {
  const businessHours = parseBusinessHours(campus?.businessHours ?? null);

  if (!businessHours) {
    return null;
  }

  const startMinutes = minutesOfUtcDay(candidate.startAt);
  const endMinutes = minutesOfUtcDay(candidate.endAt);
  const isSameUtcDay =
    candidate.startAt.toISOString().slice(0, 10) === candidate.endAt.toISOString().slice(0, 10);

  if (
    !isSameUtcDay ||
    startMinutes < businessHours.startMinutes ||
    endMinutes > businessHours.endMinutes
  ) {
    return {
      type: "campus_business_hours" as const,
      message: `${campus?.name ?? "校区"}营业时间为 ${businessHours.label}，${formatRange(
        candidate.startAt,
        candidate.endAt,
      )} 不在可排课时间内。`,
      startAt: candidate.startAt,
      endAt: candidate.endAt,
    };
  }

  return null;
}

export async function findScheduleConflicts(
  tx: ScheduleConflictClient,
  tenantId: string,
  candidates: ScheduleConflictCandidate[],
  options: ScheduleConflictOptions = {},
) {
  if (candidates.length === 0) {
    return [];
  }

  const classGroupIds = unique(candidates.map((candidate) => candidate.classGroupId));
  const teacherIds = unique(candidates.map((candidate) => candidate.teacherId));
  const roomIds = unique(candidates.map((candidate) => candidate.roomId));
  const campusIds = unique(candidates.map((candidate) => candidate.campusId));
  const classGroupStudents = await tx.classGroupStudent.findMany({
    where: {
      tenantId,
      classGroupId: {
        in: classGroupIds,
      },
    },
    select: {
      classGroupId: true,
      studentId: true,
    },
  });
  const candidateStudentIdsByClassGroup = new Map<string, Set<string>>();

  for (const classGroupId of classGroupIds) {
    candidateStudentIdsByClassGroup.set(classGroupId, new Set<string>());
  }

  for (const classGroupStudent of classGroupStudents) {
    candidateStudentIdsByClassGroup
      .get(classGroupStudent.classGroupId)
      ?.add(classGroupStudent.studentId);
  }

  const studentIds = unique(classGroupStudents.map((student) => student.studentId));
  const [campuses, schedules] = await Promise.all([
    tx.campus.findMany({
      where: {
        tenantId,
        id: {
          in: campusIds,
        },
      },
      select: {
        id: true,
        name: true,
        businessHours: true,
      },
    }),
    tx.schedule.findMany({
      where: {
        tenantId,
        id:
          options.excludeScheduleIds && options.excludeScheduleIds.length > 0
            ? {
                notIn: options.excludeScheduleIds,
              }
            : undefined,
        status: {
          in: ["SCHEDULED", "RESCHEDULED", "MAKE_UP"],
        },
        AND: [
          {
            OR: candidates.map((candidate) => ({
              startAt: {
                lt: candidate.endAt,
              },
              endAt: {
                gt: candidate.startAt,
              },
            })),
          },
          {
            OR: [
              { teacherId: { in: teacherIds } },
              { roomId: { in: roomIds } },
              { classGroupId: { in: classGroupIds } },
              ...(studentIds.length > 0
                ? [
                    {
                      classGroup: {
                        students: {
                          some: {
                            studentId: {
                              in: studentIds,
                            },
                          },
                        },
                      },
                    },
                  ]
                : []),
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
        teacher: {
          select: {
            name: true,
          },
        },
        room: {
          select: {
            name: true,
            campus: {
              select: {
                name: true,
              },
            },
          },
        },
        classGroup: {
          select: {
            name: true,
            students: {
              select: {
                studentId: true,
              },
            },
          },
        },
      },
    }),
  ]);
  const campusesById = new Map(campuses.map((campus) => [campus.id, campus]));
  const conflicts: ScheduleConflict[] = [];

  for (const candidate of candidates) {
    const businessHourConflict = getBusinessHourConflict(
      candidate,
      campusesById.get(candidate.campusId),
    );

    if (businessHourConflict) {
      conflicts.push(businessHourConflict);
    }

    const candidateStudentIds =
      candidateStudentIdsByClassGroup.get(candidate.classGroupId) ?? new Set<string>();

    for (const schedule of schedules) {
      if (!overlaps(candidate, schedule)) {
        continue;
      }

      if (schedule.teacherId === candidate.teacherId) {
        conflicts.push({
          type: "teacher_time",
          scheduleId: schedule.id,
          message: `${schedule.teacher.name} 在 ${formatRange(
            schedule.startAt,
            schedule.endAt,
          )} 已有排课。`,
          startAt: candidate.startAt,
          endAt: candidate.endAt,
        });
      }

      if (schedule.roomId === candidate.roomId) {
        conflicts.push({
          type: "room_time",
          scheduleId: schedule.id,
          message: `${schedule.room.campus.name}/${schedule.room.name} 在 ${formatRange(
            schedule.startAt,
            schedule.endAt,
          )} 已被占用。`,
          startAt: candidate.startAt,
          endAt: candidate.endAt,
        });
      }

      if (schedule.classGroupId === candidate.classGroupId) {
        conflicts.push({
          type: "class_group_duplicate",
          scheduleId: schedule.id,
          message: `${schedule.classGroup.name} 在 ${formatRange(
            schedule.startAt,
            schedule.endAt,
          )} 已有课程。`,
          startAt: candidate.startAt,
          endAt: candidate.endAt,
        });
      }

      if (
        schedule.classGroupId !== candidate.classGroupId &&
        schedule.classGroup.students.some((student) => candidateStudentIds.has(student.studentId))
      ) {
        conflicts.push({
          type: "student_time",
          scheduleId: schedule.id,
          message: `学生在 ${schedule.classGroup.name} 的 ${formatRange(
            schedule.startAt,
            schedule.endAt,
          )} 已有排课。`,
          startAt: candidate.startAt,
          endAt: candidate.endAt,
        });
      }
    }
  }

  return conflicts;
}

export async function findBasicScheduleConflicts(
  tx: ScheduleConflictClient,
  tenantId: string,
  input: BasicScheduleConflictInput,
  occurrences: WeeklyScheduleOccurrence[],
) {
  return findScheduleConflicts(
    tx,
    tenantId,
    occurrences.map((occurrence) => ({
      classGroupId: input.classGroupId,
      teacherId: input.teacherId,
      roomId: input.roomId,
      campusId: input.campusId ?? "",
      startAt: occurrence.startAt,
      endAt: occurrence.endAt,
    })),
  );
}
