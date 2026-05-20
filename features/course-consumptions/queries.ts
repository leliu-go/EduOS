import { prisma } from "@/lib/prisma";

export type CourseConsumptionLedgerFilters = {
  query?: string;
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
  const where = {
    tenantId,
    ...(query
      ? {
          OR: [
            { student: { name: { contains: query, mode: "insensitive" as const } } },
            { courseProduct: { name: { contains: query, mode: "insensitive" as const } } },
            {
              schedule: {
                classGroup: { name: { contains: query, mode: "insensitive" as const } },
              },
            },
          ],
        }
      : {}),
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
