"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { findBasicScheduleConflicts } from "./conflicts";
import { buildWeeklyScheduleOccurrences } from "./recurring";
import {
  getScheduleBatchCreateFormValues,
  getScheduleCreateFormValues,
  type ScheduleCreateFormValues,
} from "./schedule-schema";

function redirectWithScheduleError(error: string): never {
  redirect(`/dashboard/scheduling?error=${error}`);
}

function formatScheduleDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function scheduleSnapshot(schedule: {
  id: string;
  tenantId: string;
  classGroupId: string;
  teacherId: string;
  campusId: string;
  roomId: string;
  lessonId: string | null;
  startAt: Date;
  endAt: Date;
  status: string;
}) {
  return {
    id: schedule.id,
    tenantId: schedule.tenantId,
    classGroupId: schedule.classGroupId,
    teacherId: schedule.teacherId,
    campusId: schedule.campusId,
    roomId: schedule.roomId,
    lessonId: schedule.lessonId,
    startAt: schedule.startAt,
    endAt: schedule.endAt,
    status: schedule.status,
  };
}

type ScheduleScopeClient = {
  classGroup: {
    findFirst(args: {
      where: {
        id: string;
        tenantId: string;
        status: {
          in: ["PLANNING", "ACTIVE", "PAUSED"];
        };
      };
    }): Promise<{ id: string } | null>;
  };
  teacherProfile: {
    findFirst(args: {
      where: {
        id: string;
        tenantId: string;
        status: "ACTIVE";
      };
    }): Promise<{ id: string } | null>;
  };
  room: {
    findFirst(args: {
      where: {
        id: string;
        tenantId: string;
        status: "ACTIVE";
      };
      select: {
        id: true;
        campusId: true;
      };
    }): Promise<{ id: string; campusId: string } | null>;
  };
};

type ScheduleScopeValues = Pick<ScheduleCreateFormValues, "classGroupId" | "teacherId" | "roomId">;

async function getScheduleScope(
  tx: ScheduleScopeClient,
  tenantId: string,
  values: ScheduleScopeValues,
) {
  const [classGroup, teacher, room] = await Promise.all([
    tx.classGroup.findFirst({
      where: {
        id: values.classGroupId,
        tenantId,
        status: {
          in: ["PLANNING", "ACTIVE", "PAUSED"],
        },
      },
    }),
    tx.teacherProfile.findFirst({
      where: {
        id: values.teacherId,
        tenantId,
        status: "ACTIVE",
      },
    }),
    tx.room.findFirst({
      where: {
        id: values.roomId,
        tenantId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        campusId: true,
      },
    }),
  ]);

  return {
    classGroup,
    teacher,
    room,
  };
}

function weeklyRecurrenceRule(weeks: number) {
  return `FREQ=WEEKLY;COUNT=${weeks}`;
}

export async function createScheduleAction(formData: FormData) {
  const currentUser = await requirePermission("scheduling:mutate", {
    nextPath: "/dashboard/scheduling",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getScheduleCreateFormValues(formData);

  if (!parsed.success) {
    redirectWithScheduleError("invalid_input");
  }

  const result = await prisma.$transaction(async (tx) => {
    const scope = await getScheduleScope(tx, currentUser.tenantId, parsed.data);

    if (!scope.classGroup || !scope.teacher || !scope.room) {
      return null;
    }

    const lesson = await tx.lesson.create({
      data: {
        tenantId: currentUser.tenantId,
        classGroupId: scope.classGroup.id,
        teacherId: scope.teacher.id,
        title: parsed.data.lessonTitle,
        status: "SCHEDULED",
      },
    });

    const schedule = await tx.schedule.create({
      data: {
        tenantId: currentUser.tenantId,
        classGroupId: scope.classGroup.id,
        teacherId: scope.teacher.id,
        campusId: scope.room.campusId,
        roomId: scope.room.id,
        lessonId: lesson.id,
        startAt: parsed.data.startAt,
        endAt: parsed.data.endAt,
        status: "SCHEDULED",
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "schedule.create",
        entityType: "schedule",
        entityId: schedule.id,
        afterJson: {
          ...scheduleSnapshot(schedule),
          lessonTitle: lesson.title,
        },
      },
      tx,
    );

    return schedule;
  });

  if (!result) {
    redirectWithScheduleError("invalid_scope");
  }

  revalidatePath("/dashboard/scheduling");
  redirect(`/dashboard/scheduling?view=day&date=${formatScheduleDate(result.startAt)}`);
}

export async function createWeeklySchedulesAction(formData: FormData) {
  const currentUser = await requirePermission("scheduling:mutate", {
    nextPath: "/dashboard/scheduling",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getScheduleBatchCreateFormValues(formData);

  if (!parsed.success) {
    redirectWithScheduleError("invalid_input");
  }

  const result = await prisma.$transaction(async (tx) => {
    const scope = await getScheduleScope(tx, currentUser.tenantId, parsed.data);

    if (!scope.classGroup || !scope.teacher || !scope.room) {
      return { status: "invalid_scope" as const };
    }

    const occurrences = buildWeeklyScheduleOccurrences({
      lessonTitle: parsed.data.lessonTitle,
      startAt: parsed.data.firstStartAt,
      endAt: parsed.data.firstEndAt,
      weeks: parsed.data.weeks,
    });
    const conflicts = await findBasicScheduleConflicts(
      tx,
      currentUser.tenantId,
      {
        classGroupId: scope.classGroup.id,
        teacherId: scope.teacher.id,
        roomId: scope.room.id,
      },
      occurrences,
    );

    if (conflicts.length > 0) {
      return { status: "conflict" as const };
    }

    const recurrenceRule = weeklyRecurrenceRule(parsed.data.weeks);
    const scheduleIds: string[] = [];
    let sourceScheduleId: string | null = null;

    for (const occurrence of occurrences) {
      const lesson = await tx.lesson.create({
        data: {
          tenantId: currentUser.tenantId,
          classGroupId: scope.classGroup.id,
          teacherId: scope.teacher.id,
          title: occurrence.title,
          status: "SCHEDULED",
        },
        select: {
          id: true,
        },
      });
      const schedule: { id: string } = await tx.schedule.create({
        data: {
          tenantId: currentUser.tenantId,
          classGroupId: scope.classGroup.id,
          teacherId: scope.teacher.id,
          campusId: scope.room.campusId,
          roomId: scope.room.id,
          lessonId: lesson.id,
          sourceScheduleId,
          startAt: occurrence.startAt,
          endAt: occurrence.endAt,
          status: "SCHEDULED",
          recurrenceRule,
        },
        select: {
          id: true,
        },
      });

      sourceScheduleId ??= schedule.id;
      scheduleIds.push(schedule.id);
    }

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "schedule.batchCreate",
        entityType: "scheduleBatch",
        entityId: sourceScheduleId ?? "unknown",
        afterJson: {
          scheduleIds,
          classGroupId: scope.classGroup.id,
          teacherId: scope.teacher.id,
          roomId: scope.room.id,
          weeks: parsed.data.weeks,
          recurrenceRule,
        },
      },
      tx,
    );

    return {
      status: "ok" as const,
      firstStartAt: parsed.data.firstStartAt,
    };
  });

  if (result.status === "invalid_scope") {
    redirectWithScheduleError("invalid_scope");
  }

  if (result.status === "conflict") {
    redirectWithScheduleError("schedule_conflict");
  }

  revalidatePath("/dashboard/scheduling");
  redirect(`/dashboard/scheduling?view=week&date=${formatScheduleDate(result.firstStartAt)}`);
}
