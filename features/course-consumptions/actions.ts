"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { getCourseConsumptionReversalFormValues } from "./consumption-schema";

function redirectWithCourseConsumptionError(error: string): never {
  redirect(`/dashboard/course-consumptions?error=${error}`);
}

function courseConsumptionReversalSnapshot(input: {
  id: string;
  tenantId: string;
  scheduleId: string;
  studentId: string;
  courseProductId: string;
  courseAccountId: string;
  consumedHours: number;
  reversedAt: Date | null;
  reversedByUserId: string | null;
  reversalReason: string | null;
}) {
  return {
    id: input.id,
    tenantId: input.tenantId,
    scheduleId: input.scheduleId,
    studentId: input.studentId,
    courseProductId: input.courseProductId,
    courseAccountId: input.courseAccountId,
    consumedHours: input.consumedHours,
    reversedAt: input.reversedAt,
    reversedByUserId: input.reversedByUserId,
    reversalReason: input.reversalReason,
  };
}

export async function reverseCourseConsumptionAction(formData: FormData) {
  const currentUser = await requirePermission("courseConsumption:mutate", {
    nextPath: "/dashboard",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getCourseConsumptionReversalFormValues(formData);

  if (!parsed.success) {
    redirectWithCourseConsumptionError("invalid_input");
  }

  const reversedConsumption = await prisma.$transaction(async (tx) => {
    const consumption = await tx.courseConsumption.findFirst({
      where: {
        id: parsed.data.courseConsumptionId,
        tenantId: currentUser.tenantId,
        reversedAt: null,
      },
    });

    if (!consumption) {
      return null;
    }

    const reversedAt = new Date();
    const reversalResult = await tx.courseConsumption.updateMany({
      where: {
        id: consumption.id,
        tenantId: currentUser.tenantId,
        reversedAt: null,
      },
      data: {
        reversedAt,
        reversedByUserId: currentUser.id,
        reversalReason: parsed.data.reason,
      },
    });

    if (reversalResult.count !== 1) {
      return null;
    }

    const accountRestoreResult = await tx.courseAccount.updateMany({
      where: {
        id: consumption.courseAccountId,
        tenantId: currentUser.tenantId,
      },
      data: {
        usedHours: {
          decrement: consumption.consumedHours,
        },
      },
    });

    if (accountRestoreResult.count !== 1) {
      throw new Error("Unable to restore tenant-scoped course account.");
    }

    const reversed = await tx.courseConsumption.findFirst({
      where: {
        id: consumption.id,
        tenantId: currentUser.tenantId,
      },
    });

    if (!reversed) {
      return null;
    }

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "courseConsumption.reverse",
        entityType: "courseConsumption",
        entityId: reversed.id,
        beforeJson: courseConsumptionReversalSnapshot(consumption),
        afterJson: courseConsumptionReversalSnapshot(reversed),
        reason: parsed.data.reason,
      },
      tx,
    );

    return reversed;
  });

  if (!reversedConsumption) {
    redirectWithCourseConsumptionError("not_reversible");
  }

  revalidatePath("/dashboard/course-consumptions");
  revalidatePath("/dashboard/course-accounts");
  revalidatePath("/student");
  revalidatePath("/parent/consumption");
  redirect("/dashboard/course-consumptions?reversal=reversed");
}
