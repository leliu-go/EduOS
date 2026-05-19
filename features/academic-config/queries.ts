import { prisma } from "@/lib/prisma";

export async function getAcademicConfig(tenantId: string) {
  const [subjects, grades, terms] = await prisma.$transaction([
    prisma.subject.findMany({
      where: { tenantId },
      orderBy: [{ status: "asc" }, { name: "asc" }],
    }),
    prisma.grade.findMany({
      where: { tenantId },
      orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.term.findMany({
      where: { tenantId },
      orderBy: [{ startsAt: "desc" }, { name: "asc" }],
    }),
  ]);

  return {
    subjects,
    grades,
    terms,
  };
}
