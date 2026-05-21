import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CourseConsumptionLedgerFilters = {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
};

const courseConsumptionLedgerInclude = {
  student: true,
  courseProduct: {
    include: {
      subject: true,
      grade: true,
    },
  },
  courseAccount: true,
  schedule: {
    include: {
      classGroup: true,
    },
  },
} as const;

export async function getCourseConsumptionLedger(
  tenantId: string,
  filters: CourseConsumptionLedgerFilters = {},
) {
  const query = filters.query?.trim();
  const pageSize = filters.pageSize ?? 10;
  const page = Math.max(filters.page ?? 1, 1);
  const skip = (page - 1) * pageSize;
  const andFilters: Prisma.CourseConsumptionWhereInput[] = [];

  if (query) {
    andFilters.push({
      OR: [
        { student: { name: { contains: query, mode: "insensitive" as const } } },
        { courseProduct: { name: { contains: query, mode: "insensitive" as const } } },
        {
          schedule: {
            classGroup: { name: { contains: query, mode: "insensitive" as const } },
          },
        },
      ],
    });
  }

  if (filters.dateFrom || filters.dateTo) {
    andFilters.push({
      schedule: {
        startAt: {
          ...(filters.dateFrom ? { gte: new Date(`${filters.dateFrom}T00:00:00.000Z`) } : {}),
          ...(filters.dateTo ? { lt: new Date(`${filters.dateTo}T23:59:59.999Z`) } : {}),
        },
      },
    });
  }

  const where: Prisma.CourseConsumptionWhereInput = {
    tenantId,
    ...(andFilters.length > 0 ? { AND: andFilters } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.courseConsumption.findMany({
      where,
      include: courseConsumptionLedgerInclude,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.courseConsumption.count({
      where,
    }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function getStudentCourseConsumptionLedger(
  tenantId: string,
  userId: string,
  options: { limit?: number } = {},
) {
  return prisma.courseConsumption.findMany({
    where: {
      tenantId,
      student: {
        userId,
      },
    },
    include: courseConsumptionLedgerInclude,
    orderBy: [{ createdAt: "desc" }],
    take: options.limit,
  });
}

export async function getParentCourseConsumptionLedger(
  tenantId: string,
  userId: string,
  options: { limit?: number } = {},
) {
  return prisma.courseConsumption.findMany({
    where: {
      tenantId,
      student: {
        guardians: {
          some: {
            guardian: {
              tenantId,
              userId,
            },
          },
        },
      },
    },
    include: courseConsumptionLedgerInclude,
    orderBy: [{ createdAt: "desc" }],
    take: options.limit,
  });
}
