import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { teacherStatusValues, type TeacherStatusValue } from "./teacher-schema";

export const teacherPageSize = 10;

export type TeacherListQuery = {
  search?: string;
  status?: TeacherStatusValue;
  page?: number;
};

export function normalizeTeacherListQuery(params: Record<string, string | string[] | undefined>) {
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const status = typeof params.status === "string" ? params.status : "";
  const pageValue = typeof params.page === "string" ? Number.parseInt(params.page, 10) : 1;

  return {
    search: search || undefined,
    status: teacherStatusValues.includes(status as TeacherStatusValue)
      ? (status as TeacherStatusValue)
      : undefined,
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
  } satisfies TeacherListQuery;
}

function buildTeacherWhere(tenantId: string, query: TeacherListQuery) {
  const where: Prisma.TeacherProfileWhereInput = {
    tenantId,
  };

  if (query.status) {
    where.status = query.status;
  } else {
    where.status = { not: "RESIGNED" };
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function getTeacherList(tenantId: string, query: TeacherListQuery) {
  const page = query.page ?? 1;
  const where = buildTeacherWhere(tenantId, query);
  const [teachers, total] = await prisma.$transaction([
    prisma.teacherProfile.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * teacherPageSize,
      take: teacherPageSize,
    }),
    prisma.teacherProfile.count({ where }),
  ]);

  return {
    teachers,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / teacherPageSize)),
  };
}

export async function getTeacherById(tenantId: string, teacherId: string) {
  return prisma.teacherProfile.findFirst({
    where: {
      id: teacherId,
      tenantId,
    },
  });
}

export async function getTeacherProfileForUser(tenantId: string, userId: string) {
  return prisma.teacherProfile.findFirst({
    where: {
      tenantId,
      userId,
      status: "ACTIVE",
    },
  });
}
