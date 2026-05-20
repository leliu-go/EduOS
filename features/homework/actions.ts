"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import {
  getHomeworkCorrectionValues,
  getHomeworkCreateValues,
  getHomeworkSubmissionValues,
  type HomeworkCorrectionValues,
  type HomeworkCreateValues,
  type HomeworkSubmissionValues,
} from "./homework-schema";

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

function homeworkSubmissionSnapshot(input: {
  id: string;
  tenantId: string;
  homeworkId: string;
  studentId: string;
  attemptNumber: number;
  status: string;
  contentText: string | null;
  attachmentsJson: unknown;
  submittedAt: Date;
}) {
  return {
    id: input.id,
    tenantId: input.tenantId,
    homeworkId: input.homeworkId,
    studentId: input.studentId,
    attemptNumber: input.attemptNumber,
    status: input.status,
    contentText: input.contentText,
    attachmentsJson: input.attachmentsJson,
    submittedAt: input.submittedAt,
  };
}

function homeworkCorrectionSnapshot(input: {
  id: string;
  tenantId: string;
  submissionId: string;
  teacherId: string | null;
  status: string;
  score: number | null;
  comment: string | null;
  correctedAt: Date;
}) {
  return {
    id: input.id,
    tenantId: input.tenantId,
    submissionId: input.submissionId,
    teacherId: input.teacherId,
    status: input.status,
    score: input.score,
    comment: input.comment,
    correctedAt: input.correctedAt,
  };
}

function errorRecordSnapshot(input: {
  id: string;
  tenantId: string;
  studentId: string;
  questionId: string | null;
  homeworkSubmissionId: string | null;
  sourceType: string;
  sourceTitle: string | null;
  knowledgePointId: string;
  errorReason: string;
  status: string;
  note: string | null;
}) {
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

function buildSubmissionAttachments(values: HomeworkSubmissionValues) {
  const attachments: Array<{ type: "FILE" | "IMAGE"; fileName: string | null; url: string }> = [];

  if (values.fileUrl) {
    attachments.push({
      type: "FILE",
      fileName: values.fileName ?? null,
      url: values.fileUrl,
    });
  }

  if (values.imageUrl) {
    attachments.push({
      type: "IMAGE",
      fileName: null,
      url: values.imageUrl,
    });
  }

  return attachments.length > 0 ? attachments : undefined;
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

async function canCorrectHomeworkSubmission(
  tx: Prisma.TransactionClient,
  currentUser: HomeworkActor,
  values: HomeworkCorrectionValues,
) {
  const isTeacher = currentUser.roleKey === "TEACHER";

  return tx.homeworkSubmission.findFirst({
    where: {
      id: values.submissionId,
      tenantId: currentUser.tenantId,
      status: {
        in: ["SUBMITTED", "PENDING_CORRECTION", "NEEDS_REVISION"],
      },
      ...(isTeacher
        ? {
            homework: {
              OR: [
                {
                  classGroup: {
                    primaryTeacher: {
                      userId: currentUser.id,
                    },
                  },
                },
                {
                  lesson: {
                    teacher: {
                      userId: currentUser.id,
                    },
                  },
                },
                {
                  student: {
                    classGroups: {
                      some: {
                        classGroup: {
                          primaryTeacher: {
                            userId: currentUser.id,
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
          }
        : {}),
    },
    select: {
      id: true,
      homeworkId: true,
      studentId: true,
      status: true,
      homework: {
        select: {
          title: true,
        },
      },
    },
  });
}

type LatestHomeworkSubmission = {
  id: string;
  attemptNumber: number;
  status: string;
} | null;

function canSubmitHomeworkAttempt(latestSubmission: LatestHomeworkSubmission) {
  return !latestSubmission || latestSubmission.status === "NEEDS_REVISION";
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

export async function submitHomeworkAction(formData: FormData) {
  const parsed = getHomeworkSubmissionValues(formData);
  const returnTo = parsed.success ? parsed.data.returnTo : "/student/homework";
  const currentUser = await requirePermission("homework:submit", {
    nextPath: returnTo,
    unauthorizedRedirectTo: "/unauthorized",
  });

  if (!parsed.success) {
    redirectWithHomeworkError(returnTo, "invalid_submission");
  }

  const submission = await prisma.$transaction(async (tx) => {
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
      return { status: "invalid_homework" as const };
    }

    const homework = await tx.homework.findFirst({
      where: {
        id: parsed.data.homeworkId,
        tenantId: currentUser.tenantId,
        status: "ASSIGNED",
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
          {
            lesson: {
              classGroup: {
                students: {
                  some: {
                    studentId: studentProfile.id,
                  },
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

    if (!homework) {
      return { status: "invalid_homework" as const };
    }

    const latestSubmission = await tx.homeworkSubmission.findFirst({
      where: {
        tenantId: currentUser.tenantId,
        homeworkId: homework.id,
        studentId: studentProfile.id,
      },
      orderBy: {
        attemptNumber: "desc",
      },
      select: {
        id: true,
        attemptNumber: true,
        status: true,
      },
    });

    if (!canSubmitHomeworkAttempt(latestSubmission)) {
      return { status: "invalid_revision_state" as const };
    }

    const attemptNumber = latestSubmission ? latestSubmission.attemptNumber + 1 : 1;
    const attachments = buildSubmissionAttachments(parsed.data);

    const createdSubmission = await tx.homeworkSubmission.create({
      data: {
        tenantId: currentUser.tenantId,
        homeworkId: homework.id,
        studentId: studentProfile.id,
        attemptNumber,
        status: "PENDING_CORRECTION",
        contentText: parsed.data.contentText ?? null,
        ...(attachments ? { attachmentsJson: attachments } : {}),
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: latestSubmission ? "homework.revise" : "homework.submit",
        entityType: "homeworkSubmission",
        entityId: createdSubmission.id,
        beforeJson: latestSubmission
          ? {
              previousSubmissionId: latestSubmission.id,
              attemptNumber: latestSubmission.attemptNumber,
              status: latestSubmission.status,
            }
          : undefined,
        afterJson: homeworkSubmissionSnapshot(createdSubmission),
      },
      tx,
    );

    return { status: "created" as const, submission: createdSubmission };
  });

  if (submission.status === "invalid_homework") {
    redirectWithHomeworkError(returnTo, "invalid_homework");
  }

  if (submission.status === "invalid_revision_state") {
    redirectWithHomeworkError(returnTo, "invalid_revision_state");
  }

  revalidatePath("/student/homework");
  revalidatePath("/teacher/homework");
  revalidatePath("/dashboard/homework");
  redirect(`${returnTo}?homework=submitted`);
}

export async function correctHomeworkSubmissionAction(formData: FormData) {
  const parsed = getHomeworkCorrectionValues(formData);
  const returnTo = parsed.success ? parsed.data.returnTo : "/teacher/homework";
  const currentUser = await requirePermission("homework:correct", {
    nextPath: returnTo,
    unauthorizedRedirectTo: "/unauthorized",
  });

  if (!parsed.success) {
    redirectWithHomeworkError(returnTo, "invalid_correction");
  }

  const correctionResult = await prisma.$transaction(async (tx) => {
    const submission = await canCorrectHomeworkSubmission(tx, currentUser, parsed.data);

    if (!submission) {
      return { status: "invalid_submission" as const };
    }

    const teacherProfile = await tx.teacherProfile.findFirst({
      where: {
        tenantId: currentUser.tenantId,
        userId: currentUser.id,
      },
      select: {
        id: true,
      },
    });

    if (parsed.data.mistakeKnowledgePointId) {
      const knowledgePoint = await tx.knowledgePoint.findFirst({
        where: {
          id: parsed.data.mistakeKnowledgePointId,
          tenantId: currentUser.tenantId,
          status: "ACTIVE",
        },
        select: {
          id: true,
        },
      });

      if (!knowledgePoint) {
        return { status: "invalid_knowledge_point" as const };
      }
    }

    const createdCorrection = await tx.homeworkCorrection.create({
      data: {
        tenantId: currentUser.tenantId,
        submissionId: submission.id,
        teacherId: teacherProfile?.id ?? null,
        status: parsed.data.status,
        score: parsed.data.score ?? null,
        comment: parsed.data.comment,
      },
    });

    await tx.homeworkSubmission.update({
      where: {
        id: submission.id,
      },
      data: {
        status: parsed.data.status,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "homework.correct",
        entityType: "homeworkCorrection",
        entityId: createdCorrection.id,
        beforeJson: {
          submissionId: submission.id,
          status: submission.status,
        },
        afterJson: homeworkCorrectionSnapshot(createdCorrection),
      },
      tx,
    );

    if (parsed.data.mistakeKnowledgePointId) {
      const createdErrorRecord = await tx.errorRecord.create({
        data: {
          tenantId: currentUser.tenantId,
          studentId: submission.studentId,
          questionId: null,
          homeworkSubmissionId: submission.id,
          sourceType: "HOMEWORK_SUBMISSION",
          sourceTitle: submission.homework.title,
          knowledgePointId: parsed.data.mistakeKnowledgePointId,
          errorReason: parsed.data.mistakeErrorReason,
          status: "PENDING_CORRECTION",
          note: parsed.data.mistakeNote ?? null,
        },
      });

      await writeAuditLog(
        {
          tenantId: currentUser.tenantId,
          actorUserId: currentUser.id,
          action: "errorRecord.createFromHomework",
          entityType: "errorRecord",
          entityId: createdErrorRecord.id,
          afterJson: errorRecordSnapshot(createdErrorRecord),
        },
        tx,
      );
    }

    return { status: "corrected" as const, correction: createdCorrection };
  });

  if (correctionResult.status === "invalid_submission") {
    redirectWithHomeworkError(returnTo, "invalid_submission");
  }

  if (correctionResult.status === "invalid_knowledge_point") {
    redirectWithHomeworkError(returnTo, "invalid_knowledge_point");
  }

  revalidatePath("/teacher/homework");
  revalidatePath("/student/homework");
  revalidatePath("/parent");
  redirect(`${returnTo}?homework=corrected`);
}
