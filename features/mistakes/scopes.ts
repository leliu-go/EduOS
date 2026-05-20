import type { Prisma } from "@/lib/generated/prisma/client";

export function getTeacherErrorRecordScope(
  tenantId: string,
  teacherUserId: string,
): Prisma.ErrorRecordWhereInput {
  return {
    tenantId,
    OR: [
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
      {
        homeworkSubmission: {
          homework: {
            classGroup: {
              primaryTeacher: {
                userId: teacherUserId,
              },
            },
          },
        },
      },
      {
        homeworkSubmission: {
          homework: {
            lesson: {
              teacher: {
                userId: teacherUserId,
              },
            },
          },
        },
      },
      {
        homeworkSubmission: {
          homework: {
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
        },
      },
    ],
  };
}
