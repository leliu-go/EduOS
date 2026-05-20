import { prisma } from "@/lib/prisma";

const errorRecordInclude = {
  student: true,
  question: true,
  homeworkSubmission: {
    include: {
      homework: true,
    },
  },
  knowledgePoint: {
    include: {
      subject: true,
      grade: true,
      parent: true,
    },
  },
} as const;

export async function getStudentErrorRecords(tenantId: string, userId: string) {
  return prisma.errorRecord.findMany({
    where: {
      tenantId,
      student: {
        userId,
      },
    },
    include: errorRecordInclude,
    orderBy: [{ createdAt: "desc" }],
    take: 50,
  });
}

export async function getParentErrorRecords(tenantId: string, parentUserId: string) {
  return prisma.errorRecord.findMany({
    where: {
      tenantId,
      student: {
        guardians: {
          some: {
            guardian: {
              tenantId,
              userId: parentUserId,
            },
          },
        },
      },
    },
    include: errorRecordInclude,
    orderBy: [{ createdAt: "desc" }],
    take: 50,
  });
}
