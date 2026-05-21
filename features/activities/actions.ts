"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { activityCreateSchema, wordCheckinSubmissionSchema } from "./activity-schema";

function assignmentData(
  tenantId: string,
  activityId: string,
  assignedById: string,
  assignment: ReturnType<typeof activityCreateSchema.parse>["assignment"],
) {
  return {
    tenantId,
    activityId,
    targetType: assignment.targetType,
    campusId: assignment.targetType === "CAMPUS" ? assignment.campusId : null,
    classGroupId: assignment.targetType === "CLASS_GROUP" ? assignment.classGroupId : null,
    studentId: assignment.targetType === "STUDENT" ? assignment.studentId : null,
    assignedById,
  };
}

export async function createWordCheckinActivityAction(input: unknown) {
  const currentUser = await requirePermission("activities:manage", {
    unauthorizedRedirectTo: "/unauthorized",
  });
  const values = activityCreateSchema.parse(input);

  const activity = await prisma.$transaction(async (tx) => {
    const created = await tx.activity.create({
      data: {
        tenantId: currentUser.tenantId,
        title: values.title,
        description: values.description ?? null,
        type: values.type,
        status: values.status,
        startsAt: values.startsAt,
        endsAt: values.endsAt,
        wordListResourceId: values.config.wordListResourceId ?? null,
        targetWordCount: values.config.targetWordCount,
        dailyCheckInLimit: values.config.dailyCheckInLimit,
        instructions: values.config.instructions ?? null,
        createdById: currentUser.id,
        publishedAt: values.status === "PUBLISHED" ? new Date() : null,
      },
    });

    await tx.activityAssignment.create({
      data: assignmentData(currentUser.tenantId, created.id, currentUser.id, values.assignment),
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "activity.created",
        entityType: "Activity",
        entityId: created.id,
        afterJson: {
          title: created.title,
          type: created.type,
          status: created.status,
          assignment: values.assignment,
        },
      },
      tx,
    );

    return created;
  });

  revalidatePath("/dashboard");

  return {
    ok: true,
    activityId: activity.id,
  };
}

export async function publishActivityAction(activityId: string) {
  const currentUser = await requirePermission("activities:manage", {
    unauthorizedRedirectTo: "/unauthorized",
  });

  const activity = await prisma.activity.findFirst({
    where: {
      id: activityId,
      tenantId: currentUser.tenantId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!activity || activity.status === "ENDED") {
    redirect("/unauthorized");
  }

  const updated = await prisma.activity.update({
    where: {
      id: activity.id,
    },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await writeAuditLog({
    tenantId: currentUser.tenantId,
    actorUserId: currentUser.id,
    action: "activity.published",
    entityType: "Activity",
    entityId: updated.id,
    afterJson: {
      status: updated.status,
      publishedAt: updated.publishedAt,
    },
  });

  revalidatePath("/dashboard");

  return {
    ok: true,
    activityId: updated.id,
  };
}

export async function submitWordCheckinAction(input: unknown) {
  const currentUser = await requirePermission("activities:checkIn", {
    unauthorizedRedirectTo: "/unauthorized",
  });
  const values = wordCheckinSubmissionSchema.parse(input);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const student = await prisma.studentProfile.findFirst({
    where: {
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
    },
    select: {
      id: true,
    },
  });

  if (!student) {
    redirect("/unauthorized");
  }

  const activity = await prisma.activity.findFirst({
    where: {
      id: values.activityId,
      tenantId: currentUser.tenantId,
      status: "PUBLISHED",
      assignments: {
        some: {
          tenantId: currentUser.tenantId,
          OR: [
            { studentId: student.id },
            {
              classGroup: {
                students: {
                  some: {
                    studentId: student.id,
                  },
                },
              },
            },
          ],
        },
      },
    },
    select: {
      id: true,
      dailyCheckInLimit: true,
    },
  });

  if (!activity) {
    redirect("/unauthorized");
  }

  const count = await prisma.activityCheckIn.count({
    where: {
      tenantId: currentUser.tenantId,
      activityId: activity.id,
      studentId: student.id,
      checkInDate: today,
    },
  });

  if (count >= activity.dailyCheckInLimit) {
    return {
      ok: false,
      reason: "daily_limit_reached",
    };
  }

  const checkIn = await prisma.activityCheckIn.create({
    data: {
      tenantId: currentUser.tenantId,
      activityId: activity.id,
      studentId: student.id,
      studentUserId: currentUser.id,
      submittedById: currentUser.id,
      checkedWordCount: values.checkedWordCount,
      note: values.note ?? null,
      checkInDate: today,
    },
  });

  await writeAuditLog({
    tenantId: currentUser.tenantId,
    actorUserId: currentUser.id,
    action: "activity.word_checkin.submitted",
    entityType: "ActivityCheckIn",
    entityId: checkIn.id,
    afterJson: {
      activityId: activity.id,
      checkedWordCount: values.checkedWordCount,
    },
  });

  revalidatePath("/student");

  return {
    ok: true,
    checkInId: checkIn.id,
  };
}
