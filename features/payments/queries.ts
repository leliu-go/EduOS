import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const paymentListInclude = {
  order: {
    select: {
      orderNo: true,
      status: true,
      payableAmount: true,
      currency: true,
    },
  },
  student: {
    select: {
      name: true,
      grade: true,
    },
  },
  guardian: {
    select: {
      name: true,
      phone: true,
    },
  },
} satisfies Prisma.PaymentInclude;

export type PaymentListItem = Prisma.PaymentGetPayload<{
  include: typeof paymentListInclude;
}>;

const manualPaymentOrderInclude = {
  student: {
    select: {
      name: true,
      grade: true,
    },
  },
  guardian: {
    select: {
      name: true,
    },
  },
  courseProduct: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.OrderInclude;

export type ManualPaymentOrderOption = Prisma.OrderGetPayload<{
  include: typeof manualPaymentOrderInclude;
}>;

export async function getStaffPaymentList(tenantId: string) {
  return prisma.payment.findMany({
    where: {
      tenantId,
    },
    include: paymentListInclude,
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
}

export async function getManualPaymentOptions(tenantId: string) {
  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      status: "PENDING_PAYMENT",
    },
    include: manualPaymentOrderInclude,
    orderBy: [{ createdAt: "desc" }],
    take: 100,
  });

  return { orders };
}

export async function getStudentPaymentList(tenantId: string, userId: string) {
  return prisma.payment.findMany({
    where: {
      tenantId,
      student: {
        userId,
      },
    },
    include: paymentListInclude,
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
}

export async function getParentPaymentList(tenantId: string, parentUserId: string) {
  return prisma.payment.findMany({
    where: {
      tenantId,
      student: {
        guardians: {
          some: {
            guardian: {
              tenantId,
              userId: parentUserId,
            },
          },
        },
      },
    },
    include: paymentListInclude,
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
}
