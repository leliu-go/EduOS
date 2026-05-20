import { prisma } from "@/lib/prisma";

export async function getTeacherLessonFeedbackContext(
  tenantId: string,
  userId: string,
  lessonId: string,
) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      tenantId,
      teacher: {
        userId,
      },
    },
    include: {
      classGroup: true,
      teacher: true,
    },
  });

  if (!lesson) {
    return null;
  }

  const students = await prisma.studentProfile.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
      classGroups: {
        some: {
          classGroupId: lesson.classGroupId,
        },
      },
    },
    include: {
      lessonFeedbacks: {
        where: {
          tenantId,
          lessonId,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: [{ name: "asc" }],
  });

  return {
    ...lesson,
    students,
  };
}

export async function getParentLessonFeedback(tenantId: string, parentUserId: string) {
  return prisma.lessonFeedback.findMany({
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
    include: {
      lesson: {
        include: {
          classGroup: true,
        },
      },
      student: true,
      teacher: true,
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 20,
  });
}
