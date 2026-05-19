"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import {
  getAttendanceRecordFormValues,
  type AttendanceRecordFormValues,
} from "./attendance-schema";

const activeAttendanceScheduleStatuses = ["SCHEDULED", "RESCHEDULED", "MAKE_UP"] as const;

function redirectWithAttendanceError(error: string): never {
  redirect(`/teacher?attendance=${error}`);
}

function attendanceSnapshot(
  records: { id?: string; studentId: string; status: string; notes: string | null }[],
) {
  return records.map((record) => ({
    id: record.id ?? null,
    studentId: record.studentId,
    status: record.status,
    notes: record.notes,
  }));
}

function attendanceEntrySnapshot(entries: AttendanceRecordFormValues["entries"]) {
  return entries.map((entry) => ({
    studentId: entry.studentId,
    status: entry.status,
    notes: entry.notes ?? null,
  }));
}

export async function recordLessonAttendanceAction(formData: FormData) {
  const currentUser = await requirePermission("attendance:mutate", {
    nextPath: "/teacher",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getAttendanceRecordFormValues(formData);

  if (!parsed.success) {
    redirectWithAttendanceError("invalid_input");
  }

  const result = await prisma.$transaction(async (tx) => {
    const schedule = await tx.schedule.findFirst({
      where: {
        id: parsed.data.scheduleId,
        tenantId: currentUser.tenantId,
        status: {
          in: [...activeAttendanceScheduleStatuses],
        },
      },
      include: {
        teacher: {
          select: {
            userId: true,
          },
        },
        classGroup: {
          select: {
            students: {
              select: {
                studentId: true,
              },
            },
          },
        },
        attendances: true,
      },
    });

    if (!schedule) {
      return { status: "invalid_scope" as const };
    }

    if (currentUser.roleKey === "TEACHER" && schedule.teacher.userId !== currentUser.id) {
      return { status: "forbidden" as const };
    }

    const rosterStudentIds = new Set(
      schedule.classGroup.students.map((classGroupStudent) => classGroupStudent.studentId),
    );
    const entryStudentIds = new Set(parsed.data.entries.map((entry) => entry.studentId));
    const hasRosterMismatch =
      entryStudentIds.size !== rosterStudentIds.size ||
      parsed.data.entries.some((entry) => !rosterStudentIds.has(entry.studentId));

    if (hasRosterMismatch) {
      return { status: "invalid_roster" as const };
    }

    const beforeJson = {
      scheduleId: schedule.id,
      attendances: attendanceSnapshot(schedule.attendances),
    };
    const updatedAttendances = [];

    for (const entry of parsed.data.entries) {
      const attendance = await tx.attendance.upsert({
        where: {
          tenantId_scheduleId_studentId: {
            tenantId: currentUser.tenantId,
            scheduleId: schedule.id,
            studentId: entry.studentId,
          },
        },
        update: {
          status: entry.status,
          notes: entry.notes ?? null,
        },
        create: {
          tenantId: currentUser.tenantId,
          scheduleId: schedule.id,
          studentId: entry.studentId,
          status: entry.status,
          notes: entry.notes ?? null,
        },
      });

      updatedAttendances.push(attendance);
    }

    const afterJson = {
      scheduleId: schedule.id,
      entries: attendanceEntrySnapshot(parsed.data.entries),
      attendances: attendanceSnapshot(updatedAttendances),
    };

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "attendance.record",
        entityType: "schedule",
        entityId: schedule.id,
        beforeJson,
        afterJson,
      },
      tx,
    );

    return { status: "ok" as const };
  });

  if (result.status === "invalid_scope") {
    redirectWithAttendanceError("invalid_scope");
  }

  if (result.status === "forbidden") {
    redirectWithAttendanceError("forbidden");
  }

  if (result.status === "invalid_roster") {
    redirectWithAttendanceError("invalid_roster");
  }

  revalidatePath("/teacher");
  redirect("/teacher?attendance=recorded");
}
