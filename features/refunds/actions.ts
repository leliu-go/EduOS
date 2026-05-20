"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import {
  getRefundApprovalFormValues,
  getRefundRequestFormValues,
  type RefundRequestValues,
} from "./refund-schema";

function redirectWithRefundError(error: string): never {
  redirect(`/dashboard/payments?refundError=${error}`);
}

type DecimalLike = {
  toString(): string;
};

function refundSnapshot(refund: {
  id: string;
  tenantId: string;
  orderId: string | null;
  paymentId: string | null;
  courseAccountId: string;
  studentId: string;
  guardianId: string | null;
  amount: DecimalLike;
  currency: string;
  refundHours: number;
  reason: string;
  approvalNote: string | null;
  status: string;
  requestedByUserId: string | null;
  approvedByUserId: string | null;
  approvedAt: Date | null;
}) {
  return {
    id: refund.id,
    tenantId: refund.tenantId,
    orderId: refund.orderId,
    paymentId: refund.paymentId,
    courseAccountId: refund.courseAccountId,
    studentId: refund.studentId,
    guardianId: refund.guardianId,
    amount: refund.amount.toString(),
    currency: refund.currency,
    refundHours: refund.refundHours,
    reason: refund.reason,
    approvalNote: refund.approvalNote,
    status: refund.status,
    requestedByUserId: refund.requestedByUserId,
    approvedByUserId: refund.approvedByUserId,
    approvedAt: refund.approvedAt,
  };
}

function courseAccountSnapshot(courseAccount: {
  id: string;
  tenantId: string;
  studentId: string;
  courseProductId: string;
  purchasedHours: number;
  giftHours: number;
  usedHours: number;
  frozenHours: number;
  status: string;
}) {
  return {
    id: courseAccount.id,
    tenantId: courseAccount.tenantId,
    studentId: courseAccount.studentId,
    courseProductId: courseAccount.courseProductId,
    purchasedHours: courseAccount.purchasedHours,
    giftHours: courseAccount.giftHours,
    usedHours: courseAccount.usedHours,
    frozenHours: courseAccount.frozenHours,
    status: courseAccount.status,
  };
}

async function validateRefundScope(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  tenantId: string,
  values: RefundRequestValues,
) {
  const [courseAccount, order, payment, guardianBinding] = await Promise.all([
    tx.courseAccount.findFirst({
      where: {
        id: values.courseAccountId,
        tenantId,
        studentId: values.studentId,
      },
    }),
    values.orderId
      ? tx.order.findFirst({
          where: {
            id: values.orderId,
            tenantId,
            studentId: values.studentId,
          },
        })
      : Promise.resolve(null),
    values.paymentId
      ? tx.payment.findFirst({
          where: {
            id: values.paymentId,
            tenantId,
            studentId: values.studentId,
          },
        })
      : Promise.resolve(null),
    values.guardianId
      ? tx.studentGuardian.findFirst({
          where: {
            tenantId,
            studentId: values.studentId,
            guardianId: values.guardianId,
          },
        })
      : Promise.resolve(null),
  ]);

  if (!courseAccount || (values.orderId && !order) || (values.paymentId && !payment)) {
    return null;
  }

  if (values.guardianId && !guardianBinding) {
    return null;
  }

  if (values.refundHours > courseAccount.purchasedHours - courseAccount.usedHours) {
    return null;
  }

  return courseAccount;
}

export async function createRefundRequestAction(formData: FormData) {
  const currentUser = await requirePermission("finance:mutate", {
    nextPath: "/dashboard/payments",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getRefundRequestFormValues(formData);

  if (!parsed.success) {
    redirectWithRefundError("invalid_input");
  }

  const refund = await prisma.$transaction(async (tx) => {
    const courseAccount = await validateRefundScope(tx, currentUser.tenantId, parsed.data);

    if (!courseAccount) {
      return null;
    }

    const createdRefund = await tx.refund.create({
      data: {
        tenantId: currentUser.tenantId,
        orderId: parsed.data.orderId ?? null,
        paymentId: parsed.data.paymentId ?? null,
        courseAccountId: courseAccount.id,
        studentId: parsed.data.studentId,
        guardianId: parsed.data.guardianId ?? null,
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        refundHours: parsed.data.refundHours,
        reason: parsed.data.reason,
        requestedByUserId: currentUser.id,
        status: "PENDING_APPROVAL",
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "refund.create",
        entityType: "refund",
        entityId: createdRefund.id,
        afterJson: refundSnapshot(createdRefund),
        reason: parsed.data.reason,
      },
      tx,
    );

    return createdRefund;
  });

  if (!refund) {
    redirectWithRefundError("invalid_scope");
  }

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/course-accounts");
  redirect("/dashboard/payments?refund=requested");
}

export async function approveRefundAction(formData: FormData) {
  const currentUser = await requirePermission("finance:mutate", {
    nextPath: "/dashboard/payments",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getRefundApprovalFormValues(formData);

  if (!parsed.success) {
    redirectWithRefundError("invalid_approval");
  }

  const approvedRefund = await prisma.$transaction(async (tx) => {
    const refund = await tx.refund.findFirst({
      where: {
        id: parsed.data.refundId,
        tenantId: currentUser.tenantId,
        status: "PENDING_APPROVAL",
      },
      include: {
        courseAccount: true,
      },
    });

    if (
      !refund ||
      refund.refundHours > refund.courseAccount.purchasedHours - refund.courseAccount.usedHours
    ) {
      return null;
    }

    const updateResult = await tx.courseAccount.updateMany({
      where: {
        id: refund.courseAccountId,
        tenantId: currentUser.tenantId,
        purchasedHours: {
          gte: refund.refundHours + refund.courseAccount.usedHours,
        },
      },
      data: {
        purchasedHours: {
          decrement: refund.refundHours,
        },
      },
    });

    if (updateResult.count !== 1) {
      return null;
    }

    const approvedAt = new Date();
    const updatedRefund = await tx.refund.update({
      where: {
        id: refund.id,
      },
      data: {
        status: "APPROVED",
        approvalNote: parsed.data.approvalNote,
        approvedByUserId: currentUser.id,
        approvedAt,
      },
    });

    const updatedCourseAccount = await tx.courseAccount.findFirst({
      where: {
        id: refund.courseAccountId,
        tenantId: currentUser.tenantId,
      },
    });

    if (!updatedCourseAccount) {
      return null;
    }

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "refund.approve",
        entityType: "refund",
        entityId: updatedRefund.id,
        beforeJson: refundSnapshot(refund),
        afterJson: refundSnapshot(updatedRefund),
        reason: parsed.data.approvalNote,
      },
      tx,
    );
    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "courseAccount.refund",
        entityType: "courseAccount",
        entityId: updatedCourseAccount.id,
        beforeJson: courseAccountSnapshot(refund.courseAccount),
        afterJson: courseAccountSnapshot(updatedCourseAccount),
        reason: parsed.data.approvalNote,
      },
      tx,
    );

    return updatedRefund;
  });

  if (!approvedRefund) {
    redirectWithRefundError("not_approvable");
  }

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/course-accounts");
  revalidatePath("/student");
  revalidatePath("/parent/consumption");
  redirect("/dashboard/payments?refund=approved");
}
