"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { getLearningTaskCheckInValues } from "./learning-schema";

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

function redirectWithLearningTaskError(error: string): never {
  redirect(`/student?learningCheckIn=${error}`);
}

function learningTaskCheckInSnapshot(input: {
  id: string;
  tenantId: string;
  taskId: string;
  studentId: string;
  checkedInAt: Date;
  note: string | null;
}) {
  return {
    id: input.id,
    tenantId: input.tenantId,
    taskId: input.taskId,
    studentId: input.studentId,
    checkedInAt: input.checkedInAt,
    note: input.note,
  };
}

export async function checkInLearningTaskAction(formData: FormData) {
  const currentUser = await requirePermission("route:student", {
    nextPath: "/student",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getLearningTaskCheckInValues(formData);

  if (!parsed.success) {
    redirectWithLearningTaskError("invalid_input");
  }

  const now = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const studentProfile = await tx.studentProfile.findFirst({
      where: {
        tenantId: currentUser.tenantId,
        userId: currentUser.id,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });

    if (!studentProfile) {
      return { status: "invalid_scope" as const };
    }

    const task = await tx.learningTask.findFirst({
      where: {
        id: parsed.data.taskId,
        tenantId: currentUser.tenantId,
        status: "ACTIVE",
        targetDate: {
          gte: startOfDay(now),
          lte: endOfDay(now),
        },
        OR: [
          {
            student: {
              userId: currentUser.id,
            },
          },
          {
            classGroup: {
              students: {
                some: {
                  studentId: studentProfile.id,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!task) {
      return { status: "invalid_scope" as const };
    }

    const checkIn = await tx.learningTaskCheckIn.upsert({
      where: {
        tenantId_taskId_studentId: {
          tenantId: currentUser.tenantId,
          taskId: task.id,
          studentId: studentProfile.id,
        },
      },
      update: {
        note: parsed.data.note ?? null,
      },
      create: {
        tenantId: currentUser.tenantId,
        taskId: task.id,
        studentId: studentProfile.id,
        note: parsed.data.note ?? null,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "learningTask.checkIn",
        entityType: "learningTaskCheckIn",
        entityId: checkIn.id,
        afterJson: learningTaskCheckInSnapshot(checkIn),
      },
      tx,
    );

    return { status: "ok" as const };
  });

  if (result.status === "invalid_scope") {
    redirectWithLearningTaskError("invalid_scope");
  }

  revalidatePath("/student");
  redirect("/student?learningCheckIn=recorded");
}
