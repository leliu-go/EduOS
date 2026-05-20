import { prisma } from "@/lib/prisma";

import { buildErrorReasonStats } from "./error-reason-stats";

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

export async function getStudentErrorReasonStats(tenantId: string, userId: string) {
  const rows = await prisma.errorRecord.groupBy({
    by: ["errorReason"],
    where: {
      tenantId,
      student: {
        userId,
      },
    },
    _count: {
      _all: true,
    },
  });

  return buildErrorReasonStats(rows);
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

export async function getParentErrorReasonStats(tenantId: string, parentUserId: string) {
  const rows = await prisma.errorRecord.groupBy({
    by: ["errorReason"],
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
    _count: {
      _all: true,
    },
  });

  return buildErrorReasonStats(rows);
}
