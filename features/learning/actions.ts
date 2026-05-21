"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import {
  getLearningTaskCheckInValues,
  getLearningTaskCreateValues,
  type LearningTaskCreateValues,
} from "./learning-schema";

type LearningTaskActor = {
  id: string;
  tenantId: string;
  roleKey: string;
};

function startOfDay(value: Date) {
  const date = new Date(value);

  date.setHours(0, 0, 0, 0);

  return date;
}

function startOfUtcDay(value: Date) {
  const date = new Date(value);

  date.setUTCHours(0, 0, 0, 0);

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

function redirectWithLearningManageError(returnTo: string, error: string): never {
  redirect(`${returnTo}?learningTask=${error}`);
}

function learningTaskSnapshot(input: {
  id: string;
  tenantId: string;
  title: string;
  description: string | null;
  taskType: string;
  targetDate: Date;
  status: string;
  assignedByUserId: string | null;
  classGroupId: string | null;
  studentId: string | null;
}) {
  return {
    id: input.id,
    tenantId: input.tenantId,
    title: input.title,
    description: input.description,
    taskType: input.taskType,
    targetDate: input.targetDate,
    status: input.status,
    assignedByUserId: input.assignedByUserId,
    classGroupId: input.classGroupId,
    studentId: input.studentId,
  };
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

async function canAssignLearningTaskTarget(
  tx: Prisma.TransactionClient,
  currentUser: LearningTaskActor,
  values: LearningTaskCreateValues,
) {
  const isTeacher = currentUser.roleKey === "TEACHER";

  if (values.classGroupId) {
    const classGroup = await tx.classGroup.findFirst({
      where: {
        id: values.classGroupId,
        tenantId: currentUser.tenantId,
        status: {
          in: ["PLANNING", "ACTIVE", "PAUSED"],
        },
        ...(isTeacher
          ? {
              primaryTeacher: {
                userId: currentUser.id,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    return Boolean(classGroup);
  }

  if (values.studentId) {
    if (!isTeacher) {
      const student = await tx.studentProfile.findFirst({
        where: {
          id: values.studentId,
          tenantId: currentUser.tenantId,
          status: "ACTIVE",
        },
        select: {
          id: true,
        },
      });

      return Boolean(student);
    }

    const classWithStudent = await tx.classGroup.findFirst({
      where: {
        tenantId: currentUser.tenantId,
        primaryTeacher: {
          userId: currentUser.id,
        },
        students: {
          some: {
            studentId: values.studentId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return Boolean(classWithStudent);
  }

  return false;
}

export async function createLearningTaskAction(formData: FormData) {
  const parsed = getLearningTaskCreateValues(formData);
  const returnTo = parsed.success ? parsed.data.returnTo : "/dashboard/learning";
  const currentUser = await requirePermission("homework:manage", {
    nextPath: returnTo,
    unauthorizedRedirectTo: "/unauthorized",
  });

  if (!parsed.success) {
    redirectWithLearningManageError(returnTo, "invalid_input");
  }

  const learningTask = await prisma.$transaction(async (tx) => {
    const canAssignTarget = await canAssignLearningTaskTarget(tx, currentUser, parsed.data);

    if (!canAssignTarget) {
      return null;
    }

    const createdTask = await tx.learningTask.create({
      data: {
        tenantId: currentUser.tenantId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        taskType: parsed.data.taskType,
        targetDate: startOfUtcDay(parsed.data.targetDate),
        status: "ACTIVE",
        assignedByUserId: currentUser.id,
        classGroupId: parsed.data.classGroupId ?? null,
        studentId: parsed.data.studentId ?? null,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "learningTask.create",
        entityType: "learningTask",
        entityId: createdTask.id,
        afterJson: learningTaskSnapshot(createdTask),
      },
      tx,
    );

    return createdTask;
  });

  if (!learningTask) {
    redirectWithLearningManageError(returnTo, "invalid_target");
  }

  revalidatePath("/dashboard/learning");
  revalidatePath("/student");
  redirect(`${returnTo}?learningTask=created`);
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
