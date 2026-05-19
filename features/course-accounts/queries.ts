import { prisma } from "@/lib/prisma";

export type CourseAccountListFilters = {
  query?: string;
  page?: number;
  pageSize?: number;
};

const courseAccountInclude = {
  student: true,
  courseProduct: {
    include: {
      subject: true,
      grade: true,
    },
  },
} as const;

export async function getCourseAccountList(
  tenantId: string,
  filters: CourseAccountListFilters = {},
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
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.courseAccount.findMany({
      where,
      include: courseAccountInclude,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.courseAccount.count({
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

export async function getStudentCourseAccounts(tenantId: string, userId: string) {
  return prisma.courseAccount.findMany({
    where: {
      tenantId,
      student: {
        userId,
      },
    },
    include: courseAccountInclude,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getParentCourseAccounts(tenantId: string, userId: string) {
  return prisma.courseAccount.findMany({
    where: {
      tenantId,
      student: {
        guardians: {
          some: {
            guardian: {
              userId,
            },
          },
        },
      },
    },
    include: courseAccountInclude,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}
