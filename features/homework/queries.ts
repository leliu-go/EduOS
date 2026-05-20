import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type HomeworkScope = {
  teacherUserId?: string;
};

const homeworkInclude = {
  classGroup: {
    include: {
      courseProduct: true,
    },
  },
  lesson: {
    include: {
      classGroup: true,
    },
  },
  student: true,
  assignedByUser: true,
  _count: {
    select: {
      submissions: true,
    },
  },
} as const;

function getTeacherHomeworkWhere(
  tenantId: string,
  teacherUserId: string,
): Prisma.HomeworkWhereInput {
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
        lesson: {
          teacher: {
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

export async function getStaffHomeworkList(tenantId: string) {
  return prisma.homework.findMany({
    where: {
      tenantId,
    },
    include: homeworkInclude,
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    take: 50,
  });
}

export async function getTeacherHomeworkList(tenantId: string, teacherUserId: string) {
  return prisma.homework.findMany({
    where: getTeacherHomeworkWhere(tenantId, teacherUserId),
    include: homeworkInclude,
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    take: 50,
  });
}

export async function getStudentHomeworkList(tenantId: string, userId: string) {
  return prisma.homework.findMany({
    where: {
      tenantId,
      status: "ASSIGNED",
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
        {
          lesson: {
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
        },
      ],
    },
    include: {
      classGroup: {
        include: {
          courseProduct: true,
        },
      },
      lesson: {
        include: {
          classGroup: true,
        },
      },
      student: true,
      submissions: {
        where: {
          student: {
            userId,
          },
        },
        orderBy: [{ attemptNumber: "desc" }],
        take: 1,
        include: {
          corrections: {
            include: {
              teacher: true,
            },
            orderBy: [{ correctedAt: "desc" }],
            take: 1,
          },
        },
      },
    },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    take: 50,
  });
}

export async function getTeacherHomeworkSubmissionsForCorrection(
  tenantId: string,
  teacherUserId: string,
) {
  return prisma.homeworkSubmission.findMany({
    where: {
      tenantId,
      status: "PENDING_CORRECTION",
      homework: getTeacherHomeworkWhere(tenantId, teacherUserId),
    },
    include: {
      homework: {
        include: {
          classGroup: {
            include: {
              courseProduct: true,
            },
          },
          lesson: {
            include: {
              classGroup: true,
            },
          },
          student: true,
        },
      },
      student: true,
      corrections: {
        include: {
          teacher: true,
        },
        orderBy: [{ correctedAt: "desc" }],
        take: 1,
      },
    },
    orderBy: [{ submittedAt: "desc" }],
    take: 50,
  });
}

export async function getParentHomeworkCorrections(tenantId: string, parentUserId: string) {
  return prisma.homeworkCorrection.findMany({
    where: {
      tenantId,
      submission: {
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
    },
    include: {
      teacher: true,
      submission: {
        include: {
          student: true,
          homework: {
            include: {
              classGroup: true,
              lesson: true,
            },
          },
        },
      },
    },
    orderBy: [{ correctedAt: "desc" }],
    take: 20,
  });
}

export async function getHomeworkAssignmentOptions(tenantId: string, scope: HomeworkScope = {}) {
  const teacherClassScope = scope.teacherUserId
    ? {
        primaryTeacher: {
          userId: scope.teacherUserId,
        },
      }
    : {};
  const teacherLessonScope = scope.teacherUserId
    ? {
        teacher: {
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

  const [classGroups, lessons, students] = await prisma.$transaction([
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
      },
      orderBy: [{ startsAt: "desc" }, { name: "asc" }],
      take: 100,
    }),
    prisma.lesson.findMany({
      where: {
        tenantId,
        ...teacherLessonScope,
      },
      include: {
        classGroup: true,
      },
      orderBy: [{ createdAt: "desc" }, { title: "asc" }],
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
    classGroups,
    lessons,
    students,
  };
}
