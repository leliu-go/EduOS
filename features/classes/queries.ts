import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const classGroupPageSize = 9;

export type ClassGroupListQuery = {
  page?: number;
};

export function normalizeClassGroupListQuery(
  params: Record<string, string | string[] | undefined>,
) {
  const pageValue = typeof params.page === "string" ? Number.parseInt(params.page, 10) : 1;

  return {
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
  } satisfies ClassGroupListQuery;
}

function buildClassGroupWhere(tenantId: string) {
  return {
    tenantId,
    status: {
      not: "ARCHIVED",
    },
  } satisfies Prisma.ClassGroupWhereInput;
}

export async function getClassGroupList(tenantId: string, query: ClassGroupListQuery = {}) {
  const page = query.page ?? 1;
  const where = buildClassGroupWhere(tenantId);
  const [classGroups, total] = await prisma.$transaction([
    prisma.classGroup.findMany({
      where,
      include: {
        courseProduct: true,
        primaryTeacher: true,
        campus: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { startsAt: "desc" }, { name: "asc" }],
      skip: (page - 1) * classGroupPageSize,
      take: classGroupPageSize,
    }),
    prisma.classGroup.count({ where }),
  ]);

  return {
    classGroups,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / classGroupPageSize)),
  };
}

export async function getClassGroupById(tenantId: string, classGroupId: string) {
  return prisma.classGroup.findFirst({
    where: {
      id: classGroupId,
      tenantId,
    },
    include: {
      courseProduct: {
        include: {
          subject: true,
          grade: true,
        },
      },
      primaryTeacher: true,
      campus: true,
      students: {
        include: {
          student: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function getClassGroupFormOptions(tenantId: string) {
  const [courseProducts, teachers, campuses] = await prisma.$transaction([
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
    prisma.teacherProfile.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.campus.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return {
    courseProducts: courseProducts.map((courseProduct) => ({
      id: courseProduct.id,
      name: courseProduct.name,
      subject: {
        name: courseProduct.subject.name,
      },
      grade: {
        name: courseProduct.grade.name,
      },
    })),
    teachers: teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
    })),
    campuses: campuses.map((campus) => ({
      id: campus.id,
      name: campus.name,
    })),
  };
}

export async function getClassGroupStudentOptions(tenantId: string) {
  return prisma.studentProfile.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getTeacherClassGroups(tenantId: string, userId: string) {
  return prisma.classGroup.findMany({
    where: {
      tenantId,
      status: {
        in: ["PLANNING", "ACTIVE", "PAUSED"],
      },
      primaryTeacher: {
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
      campus: true,
      _count: {
        select: {
          students: true,
        },
      },
    },
    orderBy: [{ startsAt: "desc" }, { name: "asc" }],
  });
}
