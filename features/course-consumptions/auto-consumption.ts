import { writeAuditLog } from "@/lib/audit/audit-log";
import type { AttendanceStatus, Prisma } from "@/lib/generated/prisma/client";

const billableAttendanceStatuses = new Set<AttendanceStatus>(["PRESENT", "LATE", "MAKE_UP"]);
const hourMs = 60 * 60 * 1000;

type ScheduleForConsumption = {
  id: string;
  startAt: Date;
  endAt: Date;
  classGroup: {
    courseProductId: string;
  };
};

type AttendanceForConsumption = {
  id: string;
  studentId: string;
  status: AttendanceStatus;
};

export function calculateScheduleConsumedHours(schedule: { startAt: Date; endAt: Date }) {
  const durationMs = schedule.endAt.getTime() - schedule.startAt.getTime();

  return Math.max(1, Math.ceil(durationMs / hourMs));
}

function consumptionSnapshot(input: {
  id?: string;
  scheduleId: string;
  attendanceId: string | null;
  studentId: string;
  courseProductId: string;
  courseAccountId: string;
  consumedHours: number;
}) {
  return {
    id: input.id ?? null,
    scheduleId: input.scheduleId,
    attendanceId: input.attendanceId,
    studentId: input.studentId,
    courseProductId: input.courseProductId,
    courseAccountId: input.courseAccountId,
    consumedHours: input.consumedHours,
  };
}

export async function createCourseConsumptionForAttendance(
  tx: Prisma.TransactionClient,
  input: {
    tenantId: string;
    actorUserId: string;
    schedule: ScheduleForConsumption;
    attendance: AttendanceForConsumption;
  },
) {
  if (!billableAttendanceStatuses.has(input.attendance.status)) {
    return { status: "skipped" as const };
  }

  const courseProductId = input.schedule.classGroup.courseProductId;
  const courseAccount = await tx.courseAccount.findFirst({
    where: {
      tenantId: input.tenantId,
      studentId: input.attendance.studentId,
      courseProductId,
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  if (!courseAccount) {
    return { status: "missing_account" as const };
  }

  const existingConsumption = await tx.courseConsumption.findUnique({
    where: {
      tenantId_scheduleId_studentId: {
        tenantId: input.tenantId,
        scheduleId: input.schedule.id,
        studentId: input.attendance.studentId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingConsumption) {
    return { status: "duplicate" as const };
  }

  const consumedHours = calculateScheduleConsumedHours(input.schedule);
  const consumption = await tx.courseConsumption.create({
    data: {
      tenantId: input.tenantId,
      scheduleId: input.schedule.id,
      attendanceId: input.attendance.id,
      studentId: input.attendance.studentId,
      courseProductId,
      courseAccountId: courseAccount.id,
      consumedHours,
      reason: "attendance_confirmed",
    },
  });

  await tx.courseAccount.update({
    where: {
      id: courseAccount.id,
    },
    data: {
      usedHours: {
        increment: consumedHours,
      },
    },
  });
  await writeAuditLog(
    {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: "courseConsumption.create",
      entityType: "courseConsumption",
      entityId: consumption.id,
      afterJson: consumptionSnapshot(consumption),
    },
    tx,
  );

  return { status: "created" as const, consumption };
}
