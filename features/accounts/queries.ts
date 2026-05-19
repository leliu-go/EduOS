import { prisma } from "@/lib/prisma";

export async function getAccountInvitationTargets(tenantId: string) {
  const [teachers, students, guardians] = await prisma.$transaction([
    prisma.teacherProfile.findMany({
      where: {
        tenantId,
        userId: null,
        status: { not: "RESIGNED" },
      },
      orderBy: { name: "asc" },
    }),
    prisma.studentProfile.findMany({
      where: {
        tenantId,
        userId: null,
        status: { not: "WITHDRAWN" },
      },
      orderBy: { name: "asc" },
    }),
    prisma.guardianProfile.findMany({
      where: {
        tenantId,
        userId: null,
        status: "ACTIVE",
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    teachers,
    students,
    guardians,
  };
}
