"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { getLessonFeedbackValues, type LessonFeedbackValues } from "./lesson-feedback-schema";

const lessonFeedbackSnapshotSelect = {
  id: true,
  tenantId: true,
  lessonId: true,
  studentId: true,
  teacherId: true,
  content: true,
  performance: true,
  mastery: true,
  homework: true,
  suggestion: true,
} as const;

type LessonFeedbackSnapshotInput = Prisma.LessonFeedbackGetPayload<{
  select: typeof lessonFeedbackSnapshotSelect;
}>;

function redirectWithLessonFeedbackError(returnTo: string, error: string): never {
  redirect(`${returnTo}?error=${error}`);
}

function lessonFeedbackSnapshot(input: LessonFeedbackSnapshotInput) {
  return {
    id: input.id,
    tenantId: input.tenantId,
    lessonId: input.lessonId,
    studentId: input.studentId,
    teacherId: input.teacherId,
    content: input.content,
    performance: input.performance,
    mastery: input.mastery,
    homework: input.homework,
    suggestion: input.suggestion,
  };
}

function lessonFeedbackMutationData(
  values: LessonFeedbackValues,
  tenantId: string,
  teacherId: string,
) {
  return {
    tenantId,
    lessonId: values.lessonId,
    studentId: values.studentId,
    teacherId,
    content: values.content,
    performance: values.performance,
    mastery: values.mastery,
    homework: values.homework,
    suggestion: values.suggestion,
  };
}

export async function createOrUpdateLessonFeedbackAction(formData: FormData) {
  const parsed = getLessonFeedbackValues(formData);
  const returnTo = parsed.success ? parsed.data.returnTo : "/teacher";
  const currentUser = await requirePermission("lessonFeedback:manage", {
    nextPath: returnTo,
    unauthorizedRedirectTo: "/unauthorized",
  });

  if (!parsed.success) {
    redirectWithLessonFeedbackError(returnTo, "invalid_feedback");
  }

  const result = await prisma.$transaction(async (tx) => {
    const isTeacher = currentUser.roleKey === "TEACHER";
    const lesson = await tx.lesson.findFirst({
      where: {
        id: parsed.data.lessonId,
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
        classGroupId: true,
        teacherId: true,
      },
    });

    if (!lesson) {
      return { status: "invalid_lesson" as const };
    }

    const student = await tx.studentProfile.findFirst({
      where: {
        id: parsed.data.studentId,
        tenantId: currentUser.tenantId,
        status: "ACTIVE",
        classGroups: {
          some: {
            classGroupId: lesson.classGroupId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      return { status: "invalid_student" as const };
    }

    const uniqueWhere = {
      tenantId_lessonId_studentId: {
        tenantId: currentUser.tenantId,
        lessonId: lesson.id,
        studentId: student.id,
      },
    };
    const beforeFeedback = await tx.lessonFeedback.findUnique({
      where: uniqueWhere,
      select: lessonFeedbackSnapshotSelect,
    });
    const savedFeedback = await tx.lessonFeedback.upsert({
      where: uniqueWhere,
      create: lessonFeedbackMutationData(parsed.data, currentUser.tenantId, lesson.teacherId),
      update: lessonFeedbackMutationData(parsed.data, currentUser.tenantId, lesson.teacherId),
      select: lessonFeedbackSnapshotSelect,
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "lessonFeedback.upsert",
        entityType: "lessonFeedback",
        entityId: savedFeedback.id,
        beforeJson: beforeFeedback ? lessonFeedbackSnapshot(beforeFeedback) : undefined,
        afterJson: lessonFeedbackSnapshot(savedFeedback),
      },
      tx,
    );

    return { status: "saved" as const };
  });

  if (result.status === "invalid_lesson") {
    redirectWithLessonFeedbackError(returnTo, "invalid_lesson");
  }

  if (result.status === "invalid_student") {
    redirectWithLessonFeedbackError(returnTo, "invalid_student");
  }

  revalidatePath(returnTo);
  revalidatePath("/parent");
  redirect(`${returnTo}?feedback=saved`);
}
