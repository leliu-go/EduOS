import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { buildErrorReasonStats } from "./error-reason-stats";
import { getTeacherErrorRecordScope } from "./scopes";
import { buildKnowledgePointWeaknessStats } from "./weakness-stats";

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

const knowledgePointWeaknessInclude = {
  subject: true,
  grade: true,
  parent: true,
} as const;

async function getKnowledgePointWeaknessStats(
  tenantId: string,
  where: Prisma.ErrorRecordWhereInput,
) {
  const rows = await prisma.errorRecord.groupBy({
    by: ["knowledgePointId"],
    where,
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        knowledgePointId: "desc",
      },
    },
    take: 5,
  });

  if (rows.length === 0) {
    return [];
  }

  const knowledgePoints = await prisma.knowledgePoint.findMany({
    where: {
      tenantId,
      id: {
        in: rows.map((row) => row.knowledgePointId),
      },
    },
    include: knowledgePointWeaknessInclude,
  });

  return buildKnowledgePointWeaknessStats(rows, knowledgePoints);
}

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

export async function getStudentKnowledgePointWeaknessStats(tenantId: string, userId: string) {
  return getKnowledgePointWeaknessStats(tenantId, {
    tenantId,
    student: {
      userId,
    },
  });
}

export async function getStudentKnowledgePointWeaknessStatsByStudentId(
  tenantId: string,
  studentId: string,
) {
  return getKnowledgePointWeaknessStats(tenantId, {
    tenantId,
    studentId,
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

export async function getTeacherMistakeCorrectionsForApproval(
  tenantId: string,
  teacherUserId: string,
) {
  return prisma.errorRecord.findMany({
    where: {
      ...getTeacherErrorRecordScope(tenantId, teacherUserId),
      status: "CORRECTED",
    },
    include: errorRecordInclude,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: 50,
  });
}

export async function getTeacherClassWeaknessStats(tenantId: string, teacherUserId: string) {
  return getKnowledgePointWeaknessStats(
    tenantId,
    getTeacherErrorRecordScope(tenantId, teacherUserId),
  );
}
