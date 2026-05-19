import { prisma } from "@/lib/prisma";

export type EnrollmentListFilters = {
  query?: string;
  page?: number;
  pageSize?: number;
};

export async function getEnrollmentList(tenantId: string, filters: EnrollmentListFilters = {}) {
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
            { classGroup: { name: { contains: query, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.enrollment.findMany({
      where,
      include: {
        student: true,
        courseProduct: {
          include: {
            subject: true,
            grade: true,
          },
        },
        classGroup: true,
        courseAccount: true,
      },
      orderBy: {
        enrolledAt: "desc",
      },
      skip,
      take: pageSize,
    }),
    prisma.enrollment.count({
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

export async function getEnrollmentFormOptions(tenantId: string) {
  const [students, courseProducts, classGroups] = await prisma.$transaction([
    prisma.studentProfile.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.courseProduct.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      include: {
        subject: true,
        grade: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.classGroup.findMany({
      where: {
        tenantId,
        status: {
          in: ["PLANNING", "ACTIVE"],
        },
      },
      include: {
        courseProduct: true,
      },
      orderBy: [{ startsAt: "desc" }, { name: "asc" }],
    }),
  ]);

  return {
    students,
    courseProducts,
    classGroups,
  };
}

export async function getStudentEnrolledCourses(tenantId: string, userId: string) {
  return prisma.enrollment.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
      student: {
        userId,
      },
    },
    include: {
      courseProduct: {
        include: {
          subject: true,
          grade: true,
        },
      },
      classGroup: true,
      courseAccount: true,
    },
    orderBy: {
      enrolledAt: "desc",
    },
  });
}
