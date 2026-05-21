"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getPaymentProvider } from "@/features/finance/payment-provider";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { getManualPaymentFormValues } from "./payment-schema";

function redirectWithPaymentError(error: string): never {
  redirect(`/dashboard/payments?paymentError=${error}`);
}

type DecimalLike = {
  toString(): string;
};

function paymentSnapshot(payment: {
  id: string;
  tenantId: string;
  orderId: string;
  studentId: string;
  guardianId: string | null;
  amount: DecimalLike;
  currency: string;
  method: string;
  status: string;
  paidAt: Date | null;
  transactionNo: string | null;
  notes: string | null;
}) {
  return {
    id: payment.id,
    tenantId: payment.tenantId,
    orderId: payment.orderId,
    studentId: payment.studentId,
    guardianId: payment.guardianId,
    amount: payment.amount.toString(),
    currency: payment.currency,
    method: payment.method,
    status: payment.status,
    paidAt: payment.paidAt,
    transactionNo: payment.transactionNo,
    notes: payment.notes,
  };
}

export async function createManualPaymentAction(formData: FormData) {
  const currentUser = await requirePermission("finance:mutate", {
    nextPath: "/dashboard/payments",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getManualPaymentFormValues(formData);

  if (!parsed.success) {
    redirectWithPaymentError("invalid_input");
  }

  const provider = getPaymentProvider();
  const providerResult = await provider.createManualPayment({
    amount: parsed.data.amount.toString(),
    currency: "CNY",
    method: parsed.data.method,
    status: parsed.data.status,
    transactionNo: parsed.data.transactionNo,
  });

  const payment = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        id: parsed.data.orderId,
        tenantId: currentUser.tenantId,
        status: {
          not: "CANCELLED",
        },
      },
    });

    if (!order) {
      return null;
    }

    const createdPayment = await tx.payment.create({
      data: {
        tenantId: currentUser.tenantId,
        orderId: order.id,
        studentId: order.studentId,
        guardianId: order.guardianId,
        amount: parsed.data.amount,
        currency: order.currency,
        method: parsed.data.method,
        status: parsed.data.status,
        paidAt: parsed.data.status === "CONFIRMED" ? (parsed.data.paidAt ?? new Date()) : null,
        transactionNo: parsed.data.transactionNo ?? providerResult.providerPaymentId,
        notes: parsed.data.notes ?? null,
      },
    });

    if (parsed.data.status === "CONFIRMED") {
      const confirmedPayments = await tx.payment.aggregate({
        where: {
          tenantId: currentUser.tenantId,
          orderId: order.id,
          status: "CONFIRMED",
        },
        _sum: {
          amount: true,
        },
      });
      const confirmedAmount = Number(confirmedPayments._sum.amount ?? 0);
      const payableAmount = Number(order.payableAmount);

      if (confirmedAmount >= payableAmount) {
        await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: "PAID",
          },
        });
      }
    }

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "payment.manual.create",
        entityType: "payment",
        entityId: createdPayment.id,
        afterJson: {
          ...paymentSnapshot(createdPayment),
          provider: providerResult.provider,
        },
        reason: parsed.data.notes ?? "manual payment entry",
      },
      tx,
    );

    return createdPayment;
  });

  if (!payment) {
    redirectWithPaymentError("invalid_order");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/finance-reports");
  redirect("/dashboard/payments?payment=created");
}
