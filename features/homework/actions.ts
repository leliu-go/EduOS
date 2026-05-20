"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { getHomeworkCreateValues, type HomeworkCreateValues } from "./homework-schema";

type HomeworkActor = {
  id: string;
  tenantId: string;
  roleKey: string;
};

function redirectWithHomeworkError(returnTo: string, error: string): never {
  redirect(`${returnTo}?error=${error}`);
}

function homeworkSnapshot(input: {
  id: string;
  tenantId: string;
  title: string;
  instructions: string;
  dueAt: Date;
  status: string;
  assignedByUserId: string | null;
  classGroupId: string | null;
  lessonId: string | null;
  studentId: string | null;
}) {
  return {
    id: input.id,
    tenantId: input.tenantId,
    title: input.title,
    instructions: input.instructions,
    dueAt: input.dueAt,
    status: input.status,
    assignedByUserId: input.assignedByUserId,
    classGroupId: input.classGroupId,
    lessonId: input.lessonId,
    studentId: input.studentId,
  };
}

async function canAssignHomeworkTarget(
  tx: Prisma.TransactionClient,
  currentUser: HomeworkActor,
  values: HomeworkCreateValues,
) {
  const isTeacher = currentUser.roleKey === "TEACHER";

  if (values.classGroupId) {
    const classGroup = await tx.classGroup.findFirst({
      where: {
        id: values.classGroupId,
        tenantId: currentUser.tenantId,
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

  if (values.lessonId) {
    const lesson = await tx.lesson.findFirst({
      where: {
        id: values.lessonId,
        tenantId: currentUser.tenantId,
        ...(isTeacher
          ? {
              teacher: {
                userId: currentUser.id,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    return Boolean(lesson);
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

export async function createHomeworkAction(formData: FormData) {
  const parsed = getHomeworkCreateValues(formData);
  const returnTo = parsed.success ? parsed.data.returnTo : "/teacher/homework";
  const currentUser = await requirePermission("homework:manage", {
    nextPath: returnTo,
    unauthorizedRedirectTo: "/unauthorized",
  });

  if (!parsed.success) {
    redirectWithHomeworkError(returnTo, "invalid_input");
  }

  const homework = await prisma.$transaction(async (tx) => {
    const canAssignTarget = await canAssignHomeworkTarget(tx, currentUser, parsed.data);

    if (!canAssignTarget) {
      return null;
    }

    const createdHomework = await tx.homework.create({
      data: {
        tenantId: currentUser.tenantId,
        title: parsed.data.title,
        instructions: parsed.data.instructions,
        dueAt: parsed.data.dueAt,
        status: "ASSIGNED",
        assignedByUserId: currentUser.id,
        classGroupId: parsed.data.classGroupId ?? null,
        lessonId: parsed.data.lessonId ?? null,
        studentId: parsed.data.studentId ?? null,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "homework.create",
        entityType: "homework",
        entityId: createdHomework.id,
        afterJson: homeworkSnapshot(createdHomework),
      },
      tx,
    );

    return createdHomework;
  });

  if (!homework) {
    redirectWithHomeworkError(returnTo, "invalid_target");
  }

  revalidatePath("/dashboard/homework");
  revalidatePath("/teacher/homework");
  redirect(`${returnTo}?homework=created`);
}
