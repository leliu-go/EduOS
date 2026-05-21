import { prisma } from "@/lib/prisma";

export async function getRefundWorkflowOptions(tenantId: string) {
  const [courseAccounts, orders, payments, pendingRefunds] = await prisma.$transaction([
    prisma.courseAccount.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      include: {
        courseProduct: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
            guardians: {
              where: {
                isPrimary: true,
              },
              include: {
                guardian: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 100,
    }),
    prisma.order.findMany({
      where: {
        tenantId,
        status: {
          in: ["PAID", "PENDING_PAYMENT"],
        },
      },
      select: {
        id: true,
        orderNo: true,
        studentId: true,
        courseProductId: true,
        payableAmount: true,
      },
      orderBy: [{ createdAt: "desc" }],
      take: 100,
    }),
    prisma.payment.findMany({
      where: {
        tenantId,
        status: "CONFIRMED",
      },
      select: {
        id: true,
        studentId: true,
        orderId: true,
        amount: true,
        transactionNo: true,
      },
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.refund.findMany({
      where: {
        tenantId,
        status: "PENDING_APPROVAL",
      },
      include: {
        student: {
          select: {
            name: true,
          },
        },
        courseAccount: {
          include: {
            courseProduct: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 20,
    }),
  ]);

  return {
    courseAccounts: courseAccounts.map((account) => ({
      id: account.id,
      studentId: account.studentId,
      courseProductId: account.courseProductId,
      purchasedHours: account.purchasedHours,
      giftHours: account.giftHours,
      usedHours: account.usedHours,
      frozenHours: account.frozenHours,
      courseProduct: account.courseProduct,
      student: account.student,
    })),
    orders: orders.map((order) => ({
      ...order,
      payableAmount: order.payableAmount.toString(),
    })),
    payments: payments.map((payment) => ({
      ...payment,
      amount: payment.amount.toString(),
    })),
    pendingRefunds: pendingRefunds.map((refund) => ({
      id: refund.id,
      refundHours: refund.refundHours,
      amount: refund.amount.toString(),
      reason: refund.reason,
      student: refund.student,
      courseAccount: refund.courseAccount,
    })),
  };
}

export type RefundWorkflowOptions = Awaited<ReturnType<typeof getRefundWorkflowOptions>>;
