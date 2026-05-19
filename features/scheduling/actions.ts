"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { findScheduleConflicts, type ScheduleConflict } from "./conflicts";
import { buildWeeklyScheduleOccurrences } from "./recurring";
import {
  getScheduleBatchCreateFormValues,
  getScheduleCancelFormValues,
  getScheduleCreateFormValues,
  getScheduleMakeUpFormValues,
  getScheduleRescheduleFormValues,
  type ScheduleCreateFormValues,
} from "./schedule-schema";

function redirectWithScheduleError(error: string): never {
  redirect(`/dashboard/scheduling?error=${error}`);
}

function redirectWithScheduleConflicts(conflicts: ScheduleConflict[]): never {
  const conflictTypes = Array.from(new Set(conflicts.map((conflict) => conflict.type)));

  redirect(
    `/dashboard/scheduling?error=schedule_conflict&conflicts=${encodeURIComponent(
      conflictTypes.join(","),
    )}`,
  );
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
    startAt: schedule.startAt.toISOString(),
    endAt: schedule.endAt.toISOString(),
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

async function getActiveRoom(
  tx: {
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
  },
  tenantId: string,
  roomId: string,
) {
  return tx.room.findFirst({
    where: {
      id: roomId,
      tenantId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      campusId: true,
    },
  });
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
      return { status: "invalid_scope" as const };
    }

    const conflicts = await findScheduleConflicts(tx, currentUser.tenantId, [
      {
        classGroupId: scope.classGroup.id,
        teacherId: scope.teacher.id,
        roomId: scope.room.id,
        campusId: scope.room.campusId,
        startAt: parsed.data.startAt,
        endAt: parsed.data.endAt,
      },
    ]);

    if (conflicts.length > 0) {
      return {
        status: "conflict" as const,
        conflicts,
      };
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

    return {
      status: "ok" as const,
      schedule,
    };
  });

  if (result.status === "invalid_scope") {
    redirectWithScheduleError("invalid_scope");
  }

  if (result.status === "conflict") {
    redirectWithScheduleConflicts(result.conflicts);
  }

  revalidatePath("/dashboard/scheduling");
  redirect(`/dashboard/scheduling?view=day&date=${formatScheduleDate(result.schedule.startAt)}`);
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

    const classGroupId = scope.classGroup.id;
    const teacherId = scope.teacher.id;
    const roomId = scope.room.id;
    const campusId = scope.room.campusId;
    const occurrences = buildWeeklyScheduleOccurrences({
      lessonTitle: parsed.data.lessonTitle,
      startAt: parsed.data.firstStartAt,
      endAt: parsed.data.firstEndAt,
      weeks: parsed.data.weeks,
    });
    const conflicts = await findScheduleConflicts(
      tx,
      currentUser.tenantId,
      occurrences.map((occurrence) => ({
        classGroupId,
        teacherId,
        roomId,
        campusId,
        startAt: occurrence.startAt,
        endAt: occurrence.endAt,
      })),
    );

    if (conflicts.length > 0) {
      return {
        status: "conflict" as const,
        conflicts,
      };
    }

    const recurrenceRule = weeklyRecurrenceRule(parsed.data.weeks);
    const scheduleIds: string[] = [];
    let sourceScheduleId: string | null = null;

    for (const occurrence of occurrences) {
      const lesson = await tx.lesson.create({
        data: {
          tenantId: currentUser.tenantId,
          classGroupId,
          teacherId,
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
          classGroupId,
          teacherId,
          campusId,
          roomId,
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
          classGroupId,
          teacherId,
          roomId,
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
    redirectWithScheduleConflicts(result.conflicts);
  }

  revalidatePath("/dashboard/scheduling");
  redirect(`/dashboard/scheduling?view=week&date=${formatScheduleDate(result.firstStartAt)}`);
}

export async function rescheduleScheduleAction(formData: FormData) {
  const currentUser = await requirePermission("scheduling:mutate", {
    nextPath: "/dashboard/scheduling",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getScheduleRescheduleFormValues(formData);

  if (!parsed.success) {
    redirectWithScheduleError("invalid_input");
  }

  const result = await prisma.$transaction(async (tx) => {
    const schedule = await tx.schedule.findFirst({
      where: {
        id: parsed.data.scheduleId,
        tenantId: currentUser.tenantId,
      },
    });
    const room = await getActiveRoom(tx, currentUser.tenantId, parsed.data.roomId);

    if (!schedule || !room) {
      return { status: "invalid_scope" as const };
    }

    const beforeJson = scheduleSnapshot(schedule);
    const conflicts = await findScheduleConflicts(
      tx,
      currentUser.tenantId,
      [
        {
          classGroupId: schedule.classGroupId,
          teacherId: schedule.teacherId,
          roomId: room.id,
          campusId: room.campusId,
          startAt: parsed.data.startAt,
          endAt: parsed.data.endAt,
        },
      ],
      {
        excludeScheduleIds: [schedule.id],
      },
    );

    if (conflicts.length > 0) {
      return {
        status: "conflict" as const,
        conflicts,
      };
    }

    const updatedSchedule = await tx.schedule.update({
      where: {
        id: schedule.id,
      },
      data: {
        campusId: room.campusId,
        roomId: room.id,
        startAt: parsed.data.startAt,
        endAt: parsed.data.endAt,
        status: "RESCHEDULED",
      },
    });
    const afterJson = scheduleSnapshot(updatedSchedule);

    await tx.scheduleChangeLog.create({
      data: {
        tenantId: currentUser.tenantId,
        scheduleId: updatedSchedule.id,
        actorUserId: currentUser.id,
        changeType: "RESCHEDULE",
        beforeJson,
        afterJson,
        reason: parsed.data.reason,
      },
    });
    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "schedule.reschedule",
        entityType: "schedule",
        entityId: updatedSchedule.id,
        beforeJson,
        afterJson,
        reason: parsed.data.reason,
      },
      tx,
    );

    return {
      status: "ok" as const,
      startAt: updatedSchedule.startAt,
    };
  });

  if (result.status === "invalid_scope") {
    redirectWithScheduleError("invalid_scope");
  }

  if (result.status === "conflict") {
    redirectWithScheduleConflicts(result.conflicts);
  }

  revalidatePath("/dashboard/scheduling");
  redirect(`/dashboard/scheduling?view=day&date=${formatScheduleDate(result.startAt)}`);
}

export async function cancelScheduleAction(formData: FormData) {
  const currentUser = await requirePermission("scheduling:mutate", {
    nextPath: "/dashboard/scheduling",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getScheduleCancelFormValues(formData);

  if (!parsed.success) {
    redirectWithScheduleError("invalid_input");
  }

  const result = await prisma.$transaction(async (tx) => {
    const schedule = await tx.schedule.findFirst({
      where: {
        id: parsed.data.scheduleId,
        tenantId: currentUser.tenantId,
      },
    });

    if (!schedule) {
      return { status: "invalid_scope" as const };
    }

    const beforeJson = scheduleSnapshot(schedule);
    const updatedSchedule = await tx.schedule.update({
      where: {
        id: schedule.id,
      },
      data: {
        status: "CANCELLED",
      },
    });
    const afterJson = scheduleSnapshot(updatedSchedule);

    await tx.scheduleChangeLog.create({
      data: {
        tenantId: currentUser.tenantId,
        scheduleId: updatedSchedule.id,
        actorUserId: currentUser.id,
        changeType: "CANCEL",
        beforeJson,
        afterJson,
        reason: parsed.data.reason,
      },
    });
    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "schedule.cancel",
        entityType: "schedule",
        entityId: updatedSchedule.id,
        beforeJson,
        afterJson,
        reason: parsed.data.reason,
      },
      tx,
    );

    return {
      status: "ok" as const,
      startAt: updatedSchedule.startAt,
    };
  });

  if (result.status === "invalid_scope") {
    redirectWithScheduleError("invalid_scope");
  }

  revalidatePath("/dashboard/scheduling");
  redirect(`/dashboard/scheduling?view=day&date=${formatScheduleDate(result.startAt)}`);
}

export async function createMakeUpScheduleAction(formData: FormData) {
  const currentUser = await requirePermission("scheduling:mutate", {
    nextPath: "/dashboard/scheduling",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getScheduleMakeUpFormValues(formData);

  if (!parsed.success) {
    redirectWithScheduleError("invalid_input");
  }

  const result = await prisma.$transaction(async (tx) => {
    const sourceSchedule = await tx.schedule.findFirst({
      where: {
        id: parsed.data.scheduleId,
        tenantId: currentUser.tenantId,
      },
    });
    const room = await getActiveRoom(tx, currentUser.tenantId, parsed.data.roomId);

    if (!sourceSchedule || !room) {
      return { status: "invalid_scope" as const };
    }

    const conflicts = await findScheduleConflicts(tx, currentUser.tenantId, [
      {
        classGroupId: sourceSchedule.classGroupId,
        teacherId: sourceSchedule.teacherId,
        roomId: room.id,
        campusId: room.campusId,
        startAt: parsed.data.startAt,
        endAt: parsed.data.endAt,
      },
    ]);

    if (conflicts.length > 0) {
      return {
        status: "conflict" as const,
        conflicts,
      };
    }

    const makeUpSchedule = await tx.schedule.create({
      data: {
        tenantId: currentUser.tenantId,
        classGroupId: sourceSchedule.classGroupId,
        teacherId: sourceSchedule.teacherId,
        campusId: room.campusId,
        roomId: room.id,
        lessonId: sourceSchedule.lessonId,
        sourceScheduleId: sourceSchedule.id,
        startAt: parsed.data.startAt,
        endAt: parsed.data.endAt,
        status: "MAKE_UP",
      },
    });
    const beforeJson = scheduleSnapshot(sourceSchedule);
    const afterJson = scheduleSnapshot(makeUpSchedule);

    await tx.scheduleChangeLog.create({
      data: {
        tenantId: currentUser.tenantId,
        scheduleId: makeUpSchedule.id,
        actorUserId: currentUser.id,
        changeType: "MAKE_UP",
        beforeJson,
        afterJson,
        reason: parsed.data.reason,
      },
    });
    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "schedule.makeUp",
        entityType: "schedule",
        entityId: makeUpSchedule.id,
        beforeJson,
        afterJson,
        reason: parsed.data.reason,
      },
      tx,
    );

    return {
      status: "ok" as const,
      startAt: makeUpSchedule.startAt,
    };
  });

  if (result.status === "invalid_scope") {
    redirectWithScheduleError("invalid_scope");
  }

  if (result.status === "conflict") {
    redirectWithScheduleConflicts(result.conflicts);
  }

  revalidatePath("/dashboard/scheduling");
  redirect(`/dashboard/scheduling?view=day&date=${formatScheduleDate(result.startAt)}`);
}
