"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { getMistakeCorrectionValues } from "./error-record-schema";
import { getTeacherErrorRecordScope } from "./scopes";

type MistakeActor = {
  id: string;
  tenantId: string;
  roleKey: string;
};

const errorRecordSnapshotSelect = {
  id: true,
  tenantId: true,
  studentId: true,
  questionId: true,
  homeworkSubmissionId: true,
  sourceType: true,
  sourceTitle: true,
  knowledgePointId: true,
  errorReason: true,
  status: true,
  note: true,
} as const;

type ErrorRecordSnapshotInput = Prisma.ErrorRecordGetPayload<{
  select: typeof errorRecordSnapshotSelect;
}>;

function redirectWithMistakeError(returnTo: string, error: string): never {
  redirect(`${returnTo}?error=${error}`);
}

function errorRecordSnapshot(input: ErrorRecordSnapshotInput) {
  return {
    id: input.id,
    tenantId: input.tenantId,
    studentId: input.studentId,
    questionId: input.questionId,
    homeworkSubmissionId: input.homeworkSubmissionId,
    sourceType: input.sourceType,
    sourceTitle: input.sourceTitle,
    knowledgePointId: input.knowledgePointId,
    errorReason: input.errorReason,
    status: input.status,
    note: input.note,
  };
}

async function updateErrorRecordStatus(
  tx: Prisma.TransactionClient,
  currentUser: MistakeActor,
  beforeRecord: ErrorRecordSnapshotInput,
  status: "CORRECTED" | "MASTERED",
  action: "errorRecord.submitCorrection" | "errorRecord.approveCorrection",
) {
  const updatedRecord = await tx.errorRecord.update({
    where: {
      id: beforeRecord.id,
    },
    data: {
      status,
    },
    select: errorRecordSnapshotSelect,
  });

  await writeAuditLog(
    {
      tenantId: currentUser.tenantId,
      actorUserId: currentUser.id,
      action,
      entityType: "errorRecord",
      entityId: updatedRecord.id,
      beforeJson: errorRecordSnapshot(beforeRecord),
      afterJson: errorRecordSnapshot(updatedRecord),
    },
    tx,
  );

  return updatedRecord;
}

export async function submitMistakeCorrectionAction(formData: FormData) {
  const parsed = getMistakeCorrectionValues(formData);
  const returnTo = parsed.success ? parsed.data.returnTo : "/student/mistakes";
  const currentUser = await requirePermission("mistakes:viewOwn", {
    nextPath: returnTo,
    unauthorizedRedirectTo: "/unauthorized",
  });

  if (!parsed.success) {
    redirectWithMistakeError(returnTo, "invalid_correction");
  }

  const result = await prisma.$transaction(async (tx) => {
    const beforeRecord = await tx.errorRecord.findFirst({
      where: {
        id: parsed.data.errorRecordId,
        tenantId: currentUser.tenantId,
        status: "PENDING_CORRECTION",
        student: {
          userId: currentUser.id,
        },
      },
      select: errorRecordSnapshotSelect,
    });

    if (!beforeRecord) {
      return { status: "invalid_record" as const };
    }

    await updateErrorRecordStatus(
      tx,
      currentUser,
      beforeRecord,
      "CORRECTED",
      "errorRecord.submitCorrection",
    );

    return { status: "corrected" as const };
  });

  if (result.status === "invalid_record") {
    redirectWithMistakeError(returnTo, "invalid_record");
  }

  revalidatePath("/student/mistakes");
  revalidatePath("/parent/mistakes");
  revalidatePath("/teacher/homework");
  redirect(`${returnTo}?mistake=corrected`);
}

export async function approveMistakeCorrectionAction(formData: FormData) {
  const parsed = getMistakeCorrectionValues(formData);
  const returnTo = parsed.success ? parsed.data.returnTo : "/teacher/homework";
  const currentUser = await requirePermission("mistakes:manage", {
    nextPath: returnTo,
    unauthorizedRedirectTo: "/unauthorized",
  });

  if (!parsed.success) {
    redirectWithMistakeError(returnTo, "invalid_correction");
  }

  const result = await prisma.$transaction(async (tx) => {
    const beforeRecord = await tx.errorRecord.findFirst({
      where: {
        id: parsed.data.errorRecordId,
        status: "CORRECTED",
        ...(currentUser.roleKey === "TEACHER"
          ? getTeacherErrorRecordScope(currentUser.tenantId, currentUser.id)
          : { tenantId: currentUser.tenantId }),
      },
      select: errorRecordSnapshotSelect,
    });

    if (!beforeRecord) {
      return { status: "invalid_record" as const };
    }

    await updateErrorRecordStatus(
      tx,
      currentUser,
      beforeRecord,
      "MASTERED",
      "errorRecord.approveCorrection",
    );

    return { status: "mastered" as const };
  });

  if (result.status === "invalid_record") {
    redirectWithMistakeError(returnTo, "invalid_record");
  }

  revalidatePath("/teacher/homework");
  revalidatePath("/student/mistakes");
  revalidatePath("/parent/mistakes");
  redirect(`${returnTo}?mistake=mastered`);
}
