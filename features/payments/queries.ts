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

export type ManualPaymentOrderOption = {
  id: string;
  orderNo: string;
  payableAmount: string;
  currency: string;
  student: {
    name: string;
    grade: string;
  };
  guardian: {
    name: string;
  } | null;
  courseProduct: {
    name: string;
  } | null;
};

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

  return {
    orders: orders.map((order) => ({
      id: order.id,
      orderNo: order.orderNo,
      payableAmount: order.payableAmount.toString(),
      currency: order.currency,
      student: order.student,
      guardian: order.guardian,
      courseProduct: order.courseProduct,
    })),
  };
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
