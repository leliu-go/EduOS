import { prisma } from "@/lib/prisma";

import type { ResourceTypeValue } from "./resource-schema";

export type ResourceLibraryFilters = {
  query?: string;
  subjectId?: string;
  gradeId?: string;
  resourceType?: ResourceTypeValue | "";
  page?: number;
  pageSize?: number;
};

type ResourceLibraryScope = {
  teacherUserId?: string;
};

const resourceInclude = {
  courseProduct: {
    include: {
      subject: true,
      grade: true,
    },
  },
  classGroup: {
    include: {
      courseProduct: {
        include: {
          subject: true,
          grade: true,
        },
      },
    },
  },
  lesson: {
    include: {
      classGroup: {
        include: {
          courseProduct: {
            include: {
              subject: true,
              grade: true,
            },
          },
        },
      },
      teacher: true,
    },
  },
} as const;

function compactFilters<T>(filters: Array<T | null>) {
  return filters.filter((filter): filter is T => Boolean(filter));
}

function getResourceLibraryWhere(
  tenantId: string,
  filters: ResourceLibraryFilters,
  scope: ResourceLibraryScope = {},
) {
  const query = filters.query?.trim();
  const andFilters = compactFilters([
    query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { fileName: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : null,
    filters.subjectId
      ? {
          OR: [
            { courseProduct: { subjectId: filters.subjectId } },
            { classGroup: { courseProduct: { subjectId: filters.subjectId } } },
            {
              lesson: {
                classGroup: { courseProduct: { subjectId: filters.subjectId } },
              },
            },
          ],
        }
      : null,
    filters.gradeId
      ? {
          OR: [
            { courseProduct: { gradeId: filters.gradeId } },
            { classGroup: { courseProduct: { gradeId: filters.gradeId } } },
            {
              lesson: {
                classGroup: { courseProduct: { gradeId: filters.gradeId } },
              },
            },
          ],
        }
      : null,
    scope.teacherUserId
      ? {
          OR: [
            {
              courseProduct: {
                classGroups: { some: { primaryTeacher: { userId: scope.teacherUserId } } },
              },
            },
            { classGroup: { primaryTeacher: { userId: scope.teacherUserId } } },
            { lesson: { teacher: { userId: scope.teacherUserId } } },
          ],
        }
      : null,
  ]);

  return {
    tenantId,
    status: "ACTIVE" as const,
    ...(filters.resourceType ? { resourceType: filters.resourceType } : {}),
    ...(andFilters.length > 0 ? { AND: andFilters } : {}),
  };
}

export async function getResourceLibrary(
  tenantId: string,
  filters: ResourceLibraryFilters = {},
  scope: ResourceLibraryScope = {},
) {
  const pageSize = filters.pageSize ?? 10;
  const page = Math.max(filters.page ?? 1, 1);
  const skip = (page - 1) * pageSize;
  const where = getResourceLibraryWhere(tenantId, filters, scope);

  const [items, total] = await prisma.$transaction([
    prisma.resource.findMany({
      where,
      include: resourceInclude,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.resource.count({
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

export async function getTeacherResourceLibrary(
  tenantId: string,
  userId: string,
  filters: ResourceLibraryFilters = {},
) {
  return getResourceLibrary(tenantId, filters, { teacherUserId: userId });
}

export async function getResourceLibraryOptions(
  tenantId: string,
  scope: ResourceLibraryScope = {},
) {
  const teacherClassGroupWhere = scope.teacherUserId
    ? {
        primaryTeacher: {
          userId: scope.teacherUserId,
        },
      }
    : {};

  const [subjects, grades, courseProducts, classGroups, lessons] = await prisma.$transaction([
    prisma.subject.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.grade.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.courseProduct.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
        ...(scope.teacherUserId
          ? {
              classGroups: {
                some: teacherClassGroupWhere,
              },
            }
          : {}),
      },
      include: {
        subject: true,
        grade: true,
      },
      orderBy: [{ name: "asc" }],
    }),
    prisma.classGroup.findMany({
      where: {
        tenantId,
        ...teacherClassGroupWhere,
      },
      include: {
        courseProduct: true,
      },
      orderBy: [{ name: "asc" }],
    }),
    prisma.lesson.findMany({
      where: {
        tenantId,
        ...(scope.teacherUserId
          ? {
              teacher: {
                userId: scope.teacherUserId,
              },
            }
          : {}),
      },
      include: {
        classGroup: true,
      },
      orderBy: [{ title: "asc" }],
      take: 100,
    }),
  ]);

  return {
    subjects,
    grades,
    courseProducts,
    classGroups,
    lessons,
  };
}
