import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { calculateLearningCheckInStats } from "./stats";

const learningTaskTake = 20;

type LearningTaskScope = {
  teacherUserId?: string;
};

function startOfDay(value: Date) {
  const date = new Date(value);

  date.setHours(0, 0, 0, 0);

  return date;
}

function endOfDay(value: Date) {
  const date = new Date(value);

  date.setHours(23, 59, 59, 999);

  return date;
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getStudentLearningTaskWhere(
  tenantId: string,
  userId: string,
  from: Date,
  to: Date,
): Prisma.LearningTaskWhereInput {
  return {
    tenantId,
    status: "ACTIVE",
    targetDate: {
      gte: from,
      lte: to,
    },
    OR: [
      {
        student: {
          userId,
        },
      },
      {
        classGroup: {
          students: {
            some: {
              student: {
                userId,
              },
            },
          },
        },
      },
    ],
  };
}

function getTeacherLearningTaskWhere(
  tenantId: string,
  teacherUserId: string,
): Prisma.LearningTaskWhereInput {
  return {
    tenantId,
    OR: [
      {
        classGroup: {
          primaryTeacher: {
            userId: teacherUserId,
          },
        },
      },
      {
        student: {
          classGroups: {
            some: {
              classGroup: {
                primaryTeacher: {
                  userId: teacherUserId,
                },
              },
            },
          },
        },
      },
    ],
  };
}

export async function getStudentLearningTasks(tenantId: string, userId: string, date = new Date()) {
  return prisma.learningTask.findMany({
    where: getStudentLearningTaskWhere(tenantId, userId, startOfDay(date), endOfDay(date)),
    include: {
      classGroup: true,
      student: true,
      checkIns: {
        where: {
          student: {
            userId,
          },
        },
        take: 1,
      },
    },
    orderBy: [{ taskType: "asc" }, { targetDate: "asc" }, { createdAt: "asc" }],
    take: learningTaskTake,
  });
}

export async function getStudentLearningStats(tenantId: string, userId: string, date = new Date()) {
  const studentProfile = await prisma.studentProfile.findFirst({
    where: {
      tenantId,
      userId,
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  if (!studentProfile) {
    return calculateLearningCheckInStats([], dateKey(date));
  }

  const from = startOfDay(date);
  from.setDate(from.getDate() - 29);
  const tasks = await prisma.learningTask.findMany({
    where: getStudentLearningTaskWhere(tenantId, userId, from, endOfDay(date)),
    include: {
      checkIns: {
        where: {
          studentId: studentProfile.id,
        },
        take: 1,
      },
    },
    orderBy: [{ targetDate: "asc" }],
    take: 300,
  });
  const days = new Map<string, { date: string; total: number; completed: number }>();

  for (const task of tasks) {
    const key = dateKey(task.targetDate);
    const day = days.get(key) ?? { date: key, total: 0, completed: 0 };

    day.total += 1;
    day.completed += task.checkIns.length > 0 ? 1 : 0;
    days.set(key, day);
  }

  return calculateLearningCheckInStats([...days.values()], dateKey(date));
}

export async function getStaffLearningTaskList(tenantId: string, scope: LearningTaskScope = {}) {
  return prisma.learningTask.findMany({
    where: scope.teacherUserId
      ? getTeacherLearningTaskWhere(tenantId, scope.teacherUserId)
      : {
          tenantId,
        },
    include: {
      classGroup: {
        include: {
          courseProduct: true,
          students: {
            select: {
              studentId: true,
            },
          },
        },
      },
      student: true,
      assignedByUser: true,
      _count: {
        select: {
          checkIns: true,
        },
      },
    },
    orderBy: [{ targetDate: "desc" }, { createdAt: "desc" }],
    take: 80,
  });
}

export async function getLearningTaskAssignmentOptions(
  tenantId: string,
  scope: LearningTaskScope = {},
) {
  const teacherClassScope = scope.teacherUserId
    ? {
        primaryTeacher: {
          userId: scope.teacherUserId,
        },
      }
    : {};
  const teacherStudentScope = scope.teacherUserId
    ? {
        classGroups: {
          some: {
            classGroup: teacherClassScope,
          },
        },
      }
    : {};

  const [classGroups, students] = await prisma.$transaction([
    prisma.classGroup.findMany({
      where: {
        tenantId,
        status: {
          in: ["PLANNING", "ACTIVE", "PAUSED"],
        },
        ...teacherClassScope,
      },
      include: {
        courseProduct: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: [{ startsAt: "desc" }, { name: "asc" }],
      take: 100,
    }),
    prisma.studentProfile.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
        ...teacherStudentScope,
      },
      orderBy: [{ name: "asc" }],
      take: 100,
    }),
  ]);

  return {
    classGroups: classGroups.map((classGroup) => ({
      id: classGroup.id,
      name: classGroup.name,
      courseProduct: {
        name: classGroup.courseProduct.name,
      },
      studentCount: classGroup._count.students,
    })),
    students: students.map((student) => ({
      id: student.id,
      name: student.name,
      grade: student.grade,
    })),
  };
}
