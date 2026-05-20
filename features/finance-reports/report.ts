import { prisma } from "@/lib/prisma";

type DecimalLike = {
  toString(): string;
};

export type FinanceReportSummary = {
  payments: {
    confirmedAmount: number;
    pendingAmount: number;
    count: number;
  };
  refunds: {
    approvedAmount: number;
    pendingAmount: number;
    count: number;
  };
  courseConsumptionRevenue: {
    consumedHours: number;
    estimatedRevenue: number;
  };
  remainingCourseLiability: {
    remainingHours: number;
    accountCount: number;
  };
};

function decimalToNumber(value: DecimalLike | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  const numberValue = typeof value === "number" ? value : Number(value.toString());

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function escapeCsv(value: string | number) {
  const text = String(value);

  if (!/[",\n\r]/.test(text)) {
    return text;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

function csvRow(values: Array<string | number>) {
  return values.map(escapeCsv).join(",");
}

export async function getFinanceReportSummary(tenantId: string): Promise<FinanceReportSummary> {
  const [
    confirmedPayments,
    pendingPayments,
    approvedRefunds,
    pendingRefunds,
    courseConsumptions,
    courseAccountLiability,
  ] = await prisma.$transaction([
    prisma.payment.aggregate({
      where: {
        tenantId,
        status: "CONFIRMED",
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.payment.aggregate({
      where: {
        tenantId,
        status: "PENDING",
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.refund.aggregate({
      where: {
        tenantId,
        status: "APPROVED",
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.refund.aggregate({
      where: {
        tenantId,
        status: "PENDING_APPROVAL",
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.courseConsumption.findMany({
      where: {
        tenantId,
        reversedAt: null,
      },
      select: {
        consumedHours: true,
        courseProduct: {
          select: {
            price: true,
            totalHours: true,
          },
        },
      },
    }),
    prisma.courseAccount.aggregate({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      _sum: {
        purchasedHours: true,
        giftHours: true,
        usedHours: true,
        frozenHours: true,
      },
      _count: {
        _all: true,
      },
    }),
  ]);
  const consumedHours = courseConsumptions.reduce((total, item) => total + item.consumedHours, 0);
  const estimatedRevenue = courseConsumptions.reduce((total, item) => {
    const totalHours = item.courseProduct.totalHours;

    if (totalHours <= 0) {
      return total;
    }

    return total + (decimalToNumber(item.courseProduct.price) / totalHours) * item.consumedHours;
  }, 0);
  const purchasedHours = courseAccountLiability._sum.purchasedHours ?? 0;
  const giftHours = courseAccountLiability._sum.giftHours ?? 0;
  const usedHours = courseAccountLiability._sum.usedHours ?? 0;
  const frozenHours = courseAccountLiability._sum.frozenHours ?? 0;
  const remainingHours = Math.max(purchasedHours + giftHours - usedHours - frozenHours, 0);

  return {
    payments: {
      confirmedAmount: roundMoney(decimalToNumber(confirmedPayments._sum.amount)),
      pendingAmount: roundMoney(decimalToNumber(pendingPayments._sum.amount)),
      count: confirmedPayments._count._all + pendingPayments._count._all,
    },
    refunds: {
      approvedAmount: roundMoney(decimalToNumber(approvedRefunds._sum.amount)),
      pendingAmount: roundMoney(decimalToNumber(pendingRefunds._sum.amount)),
      count: approvedRefunds._count._all + pendingRefunds._count._all,
    },
    courseConsumptionRevenue: {
      consumedHours,
      estimatedRevenue: roundMoney(estimatedRevenue),
    },
    remainingCourseLiability: {
      remainingHours,
      accountCount: courseAccountLiability._count._all,
    },
  };
}

export function buildFinanceReportCsv(summary: FinanceReportSummary) {
  const rows = [
    ["metric", "value"],
    ["payments.confirmedAmount", summary.payments.confirmedAmount],
    ["payments.pendingAmount", summary.payments.pendingAmount],
    ["payments.count", summary.payments.count],
    ["refunds.approvedAmount", summary.refunds.approvedAmount],
    ["refunds.pendingAmount", summary.refunds.pendingAmount],
    ["refunds.count", summary.refunds.count],
    ["courseConsumptionRevenue.consumedHours", summary.courseConsumptionRevenue.consumedHours],
    [
      "courseConsumptionRevenue.estimatedRevenue",
      summary.courseConsumptionRevenue.estimatedRevenue,
    ],
    ["remainingCourseLiability.remainingHours", summary.remainingCourseLiability.remainingHours],
    ["remainingCourseLiability.accountCount", summary.remainingCourseLiability.accountCount],
  ];

  return rows.map(csvRow).join("\n");
}
