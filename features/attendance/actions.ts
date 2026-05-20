"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import {
  getAttendanceRecordFormValues,
  getCheckInConfirmFormValues,
  getQrCheckInFormValues,
  getStudentCheckInFormValues,
  type AttendanceRecordFormValues,
} from "./attendance-schema";
import { verifyCheckInQrToken } from "./check-in-token";

const activeAttendanceScheduleStatuses = ["SCHEDULED", "RESCHEDULED", "MAKE_UP"] as const;

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

function redirectWithAttendanceError(error: string): never {
  redirect(`/teacher?attendance=${error}`);
}

function redirectWithStudentCheckInError(error: string): never {
  redirect(`/student?checkIn=${error}`);
}

function redirectWithCheckInConfirmError(error: string): never {
  redirect(`/teacher?checkIn=${error}`);
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

function checkInSnapshot(record: {
  id: string;
  scheduleId: string;
  studentId: string;
  checkedInAt: Date;
  confirmedAt: Date | null;
  confirmedByUserId: string | null;
}) {
  return {
    id: record.id,
    scheduleId: record.scheduleId,
    studentId: record.studentId,
    checkedInAt: record.checkedInAt,
    confirmedAt: record.confirmedAt,
    confirmedByUserId: record.confirmedByUserId,
  };
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

export async function createStudentCheckInAction(formData: FormData) {
  const currentUser = await requirePermission("route:student", {
    nextPath: "/student",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getStudentCheckInFormValues(formData);

  if (!parsed.success) {
    redirectWithStudentCheckInError("invalid_input");
  }

  const now = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const schedule = await tx.schedule.findFirst({
      where: {
        id: parsed.data.scheduleId,
        tenantId: currentUser.tenantId,
        status: {
          in: [...activeAttendanceScheduleStatuses],
        },
        startAt: {
          gte: startOfDay(now),
          lte: endOfDay(now),
        },
        classGroup: {
          students: {
            some: {
              student: {
                userId: currentUser.id,
              },
            },
          },
          enrollments: {
            some: {
              status: "ACTIVE",
              student: {
                userId: currentUser.id,
              },
            },
          },
        },
      },
      include: {
        classGroup: {
          select: {
            students: {
              where: {
                student: {
                  userId: currentUser.id,
                },
              },
              select: {
                studentId: true,
              },
              take: 1,
            },
          },
        },
      },
    });
    const studentId = schedule?.classGroup.students[0]?.studentId;

    if (!schedule || !studentId) {
      return { status: "invalid_scope" as const };
    }

    const checkedInAt = new Date();
    const checkIn = await tx.checkIn.upsert({
      where: {
        tenantId_scheduleId_studentId: {
          tenantId: currentUser.tenantId,
          scheduleId: schedule.id,
          studentId,
        },
      },
      update: {},
      create: {
        tenantId: currentUser.tenantId,
        scheduleId: schedule.id,
        studentId,
        checkedInAt,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "checkIn.record",
        entityType: "checkIn",
        entityId: checkIn.id,
        afterJson: checkInSnapshot(checkIn),
      },
      tx,
    );

    return { status: "ok" as const };
  });

  if (result.status === "invalid_scope") {
    redirectWithStudentCheckInError("invalid_scope");
  }

  revalidatePath("/student");
  redirect("/student?checkIn=recorded");
}

export async function createStudentQrCheckInAction(formData: FormData) {
  const currentUser = await requirePermission("route:student", {
    nextPath: "/student",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getQrCheckInFormValues(formData);

  if (!parsed.success) {
    redirectWithStudentCheckInError("invalid_qr");
  }

  const payload = verifyCheckInQrToken(parsed.data.token);

  if (!payload || payload.tenantId !== currentUser.tenantId) {
    redirectWithStudentCheckInError("invalid_qr");
  }

  const result = await prisma.$transaction(async (tx) => {
    const schedule = await tx.schedule.findFirst({
      where: {
        id: payload.scheduleId,
        tenantId: currentUser.tenantId,
        status: {
          in: [...activeAttendanceScheduleStatuses],
        },
        classGroup: {
          students: {
            some: {
              student: {
                userId: currentUser.id,
              },
            },
          },
        },
      },
      include: {
        classGroup: {
          select: {
            students: {
              where: {
                student: {
                  userId: currentUser.id,
                },
              },
              select: {
                studentId: true,
              },
              take: 1,
            },
          },
        },
      },
    });
    const studentId = schedule?.classGroup.students[0]?.studentId;

    if (!schedule || !studentId) {
      return { status: "invalid_scope" as const };
    }

    const checkIn = await tx.checkIn.upsert({
      where: {
        tenantId_scheduleId_studentId: {
          tenantId: currentUser.tenantId,
          scheduleId: schedule.id,
          studentId,
        },
      },
      update: {},
      create: {
        tenantId: currentUser.tenantId,
        scheduleId: schedule.id,
        studentId,
        checkedInAt: new Date(),
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "checkIn.qrRecord",
        entityType: "checkIn",
        entityId: checkIn.id,
        afterJson: checkInSnapshot(checkIn),
      },
      tx,
    );

    return { status: "ok" as const };
  });

  if (result.status === "invalid_scope") {
    redirectWithStudentCheckInError("invalid_scope");
  }

  revalidatePath("/student");
  redirect("/student?checkIn=recorded");
}

export async function confirmStudentCheckInAction(formData: FormData) {
  const currentUser = await requirePermission("attendance:mutate", {
    nextPath: "/teacher",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getCheckInConfirmFormValues(formData);

  if (!parsed.success) {
    redirectWithCheckInConfirmError("invalid_input");
  }

  const result = await prisma.$transaction(async (tx) => {
    const checkIn = await tx.checkIn.findFirst({
      where: {
        id: parsed.data.checkInId,
        tenantId: currentUser.tenantId,
      },
      include: {
        schedule: {
          include: {
            teacher: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!checkIn) {
      return { status: "invalid_scope" as const };
    }

    if (currentUser.roleKey === "TEACHER" && checkIn.schedule.teacher.userId !== currentUser.id) {
      return { status: "forbidden" as const };
    }

    const beforeJson = checkInSnapshot(checkIn);
    const updatedCheckIn = await tx.checkIn.update({
      where: {
        id: checkIn.id,
      },
      data: {
        confirmedAt: new Date(),
        confirmedByUserId: currentUser.id,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "checkIn.confirm",
        entityType: "checkIn",
        entityId: updatedCheckIn.id,
        beforeJson,
        afterJson: checkInSnapshot(updatedCheckIn),
      },
      tx,
    );

    return { status: "ok" as const };
  });

  if (result.status === "invalid_scope") {
    redirectWithCheckInConfirmError("invalid_scope");
  }

  if (result.status === "forbidden") {
    redirectWithCheckInConfirmError("forbidden");
  }

  revalidatePath("/teacher");
  revalidatePath("/student");
  redirect("/teacher?checkIn=confirmed");
}
