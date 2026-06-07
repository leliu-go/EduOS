import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { studentStatusValues, type StudentStatusValue } from "./student-schema";

export const studentPageSize = 10;

export type StudentListQuery = {
  search?: string;
  status?: StudentStatusValue;
  page?: number;
};

export function normalizeStudentListQuery(params: Record<string, string | string[] | undefined>) {
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const status = typeof params.status === "string" ? params.status : "";
  const pageValue = typeof params.page === "string" ? Number.parseInt(params.page, 10) : 1;

  return {
    search: search || undefined,
    status: studentStatusValues.includes(status as StudentStatusValue)
      ? (status as StudentStatusValue)
      : undefined,
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
  } satisfies StudentListQuery;
}

function buildStudentWhere(tenantId: string, query: StudentListQuery) {
  const where: Prisma.StudentProfileWhereInput = {
    tenantId,
  };

  if (query.status) {
    where.status = query.status;
  } else {
    where.status = { not: "WITHDRAWN" };
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { grade: { contains: query.search, mode: "insensitive" } },
      { school: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function getStudentList(tenantId: string, query: StudentListQuery) {
  const page = query.page ?? 1;
  const where = buildStudentWhere(tenantId, query);
  const [students, total] = await prisma.$transaction([
    prisma.studentProfile.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * studentPageSize,
      take: studentPageSize,
    }),
    prisma.studentProfile.count({ where }),
  ]);

  return {
    students,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / studentPageSize)),
  };
}

export async function getStudentById(tenantId: string, studentId: string) {
  return prisma.studentProfile.findFirst({
    where: {
      id: studentId,
      tenantId,
    },
  });
}
