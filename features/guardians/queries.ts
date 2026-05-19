import { prisma } from "@/lib/prisma";

export async function getStudentsForParentUser(tenantId: string, parentUserId: string) {
  return prisma.studentGuardian.findMany({
    where: {
      tenantId,
      guardian: {
        userId: parentUserId,
        status: "ACTIVE",
      },
      student: {
        status: "ACTIVE",
      },
    },
    include: {
      student: true,
      guardian: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function canParentAccessStudent(
  tenantId: string,
  parentUserId: string,
  studentId: string,
) {
  const binding = await prisma.studentGuardian.findFirst({
    where: {
      tenantId,
      studentId,
      guardian: {
        userId: parentUserId,
        status: "ACTIVE",
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(binding);
}
