import { prisma } from "@/lib/prisma";

export type CourseProductListStatusFilter = "ACTIVE" | "INACTIVE";

export type CourseProductListFilters = {
  query?: string;
  status?: CourseProductListStatusFilter;
  page?: number;
  pageSize?: number;
};

export function serializeCourseProduct<T extends { price: { toString(): string } }>(
  courseProduct: T,
): Omit<T, "price"> & { price: string } {
  return {
    ...courseProduct,
    price: courseProduct.price.toString(),
  };
}

export async function getCourseProductList(
  tenantId: string,
  filters: CourseProductListFilters = {},
) {
  const query = filters.query?.trim();
  const pageSize = filters.pageSize ?? 10;
  const page = Math.max(filters.page ?? 1, 1);
  const skip = (page - 1) * pageSize;
  const where = {
    tenantId,
    status: filters.status ?? {
      not: "ARCHIVED" as const,
    },
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
            { subject: { name: { contains: query, mode: "insensitive" as const } } },
            { grade: { name: { contains: query, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.courseProduct.findMany({
      where,
      include: {
        subject: true,
        grade: true,
      },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      skip,
      take: pageSize,
    }),
    prisma.courseProduct.count({
      where,
    }),
  ]);

  return {
    items: items.map((item) => serializeCourseProduct(item)),
    total,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function getCourseProductById(tenantId: string, courseProductId: string) {
  const courseProduct = await prisma.courseProduct.findFirst({
    where: {
      id: courseProductId,
      tenantId,
    },
    include: {
      subject: true,
      grade: true,
    },
  });

  return courseProduct ? serializeCourseProduct(courseProduct) : null;
}

export async function getCourseProductFormOptions(tenantId: string) {
  const [subjects, grades] = await prisma.$transaction([
    prisma.subject.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.grade.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return {
    subjects,
    grades,
  };
}
