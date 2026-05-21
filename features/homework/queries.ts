import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { getHomeworkReminderStatus, needsStudentAction } from "./reminders";

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
        take: 5,
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

export async function getStudentHomeworkReminders(
  tenantId: string,
  userId: string,
  now = new Date(),
) {
  const homeworks = await getStudentHomeworkList(tenantId, userId);

  return homeworks.flatMap((homework) => {
    const latestSubmission = homework.submissions[0];
    const status = getHomeworkReminderStatus(
      {
        dueAt: homework.dueAt,
        needsStudentAction: needsStudentAction(latestSubmission),
      },
      now,
    );

    if (!status) {
      return [];
    }

    return [
      {
        id: homework.id,
        homework,
        status,
      },
    ];
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

function uniqueStudents(students: Array<{ id: string; name: string }>) {
  return [...new Map(students.map((student) => [student.id, student])).values()];
}

export async function getParentHomeworkReminders(
  tenantId: string,
  parentUserId: string,
  now = new Date(),
) {
  const guardianWhere = {
    guardians: {
      some: {
        guardian: {
          tenantId,
          userId: parentUserId,
        },
      },
    },
  };
  const homeworks = await prisma.homework.findMany({
    where: {
      tenantId,
      status: "ASSIGNED",
      OR: [
        {
          student: guardianWhere,
        },
        {
          classGroup: {
            students: {
              some: {
                student: guardianWhere,
              },
            },
          },
        },
        {
          lesson: {
            classGroup: {
              students: {
                some: {
                  student: guardianWhere,
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
          students: {
            where: {
              student: guardianWhere,
            },
            include: {
              student: true,
            },
          },
        },
      },
      lesson: {
        include: {
          classGroup: {
            include: {
              students: {
                where: {
                  student: guardianWhere,
                },
                include: {
                  student: true,
                },
              },
            },
          },
        },
      },
      student: true,
      submissions: {
        where: {
          student: guardianWhere,
        },
        include: {
          student: true,
        },
        orderBy: [{ attemptNumber: "desc" }],
      },
    },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  return homeworks.flatMap((homework) => {
    const students = uniqueStudents([
      ...(homework.student ? [homework.student] : []),
      ...(homework.classGroup?.students.map((entry) => entry.student) ?? []),
      ...(homework.lesson?.classGroup.students.map((entry) => entry.student) ?? []),
    ]);

    return students.flatMap((student) => {
      const latestSubmission = homework.submissions.find(
        (submission) => submission.studentId === student.id,
      );
      const status = getHomeworkReminderStatus(
        {
          dueAt: homework.dueAt,
          needsStudentAction: needsStudentAction(latestSubmission),
        },
        now,
      );

      if (!status) {
        return [];
      }

      return [
        {
          id: `${homework.id}-${student.id}`,
          homework,
          student,
          status,
        },
      ];
    });
  });
}

export async function getTeacherNotSubmittedHomework(
  tenantId: string,
  teacherUserId: string,
  now = new Date(),
) {
  const homeworks = await prisma.homework.findMany({
    where: {
      ...getTeacherHomeworkWhere(tenantId, teacherUserId),
      status: "ASSIGNED",
    },
    include: {
      classGroup: {
        include: {
          courseProduct: true,
          students: {
            include: {
              student: true,
            },
          },
        },
      },
      lesson: {
        include: {
          classGroup: {
            include: {
              students: {
                include: {
                  student: true,
                },
              },
            },
          },
        },
      },
      student: true,
      submissions: {
        orderBy: [{ attemptNumber: "desc" }],
        select: {
          studentId: true,
        },
      },
    },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  return homeworks.flatMap((homework) => {
    const students = uniqueStudents([
      ...(homework.student ? [homework.student] : []),
      ...(homework.classGroup?.students.map((entry) => entry.student) ?? []),
      ...(homework.lesson?.classGroup.students.map((entry) => entry.student) ?? []),
    ]);

    return students.flatMap((student) => {
      const hasSubmission = homework.submissions.some(
        (submission) => submission.studentId === student.id,
      );
      const status = getHomeworkReminderStatus(
        {
          dueAt: homework.dueAt,
          needsStudentAction: !hasSubmission,
        },
        now,
      );

      if (!status) {
        return [];
      }

      return [
        {
          id: `${homework.id}-${student.id}`,
          homework,
          student,
          status,
        },
      ];
    });
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

export async function getHomeworkCorrectionOptions(tenantId: string) {
  const knowledgePoints = await prisma.knowledgePoint.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
    },
    include: {
      subject: true,
      grade: true,
      parent: true,
    },
    orderBy: [{ chapter: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    take: 200,
  });

  return {
    knowledgePoints: knowledgePoints.map((knowledgePoint) => ({
      id: knowledgePoint.id,
      name: knowledgePoint.name,
      chapter: knowledgePoint.chapter,
      subject: {
        name: knowledgePoint.subject.name,
      },
      grade: {
        name: knowledgePoint.grade.name,
      },
      parent: knowledgePoint.parent
        ? {
            name: knowledgePoint.parent.name,
          }
        : null,
    })),
  };
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
    classGroups: classGroups.map((classGroup) => ({
      id: classGroup.id,
      name: classGroup.name,
      courseProduct: {
        name: classGroup.courseProduct.name,
      },
    })),
    lessons: lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      classGroup: {
        name: lesson.classGroup.name,
      },
    })),
    students: students.map((student) => ({
      id: student.id,
      name: student.name,
    })),
  };
}
