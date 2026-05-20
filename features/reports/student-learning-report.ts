import { getStudentKnowledgePointWeaknessStatsByStudentId } from "@/features/mistakes/queries";
import type { AttendanceStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const attendedAttendanceStatuses: AttendanceStatus[] = ["PRESENT", "LATE", "MAKE_UP"];

type ReportStudent = {
  id: string;
  name: string;
};

export type LearningReportTeacherComment = {
  id: string;
  lessonTitle: string;
  teacherName: string;
  content: string;
  performance: string;
  mastery: string;
  homework: string;
  suggestion: string;
};

export type StudentLearningReport = {
  student: ReportStudent;
  attendance: {
    total: number;
    attended: number;
    rate: number;
  };
  homework: {
    total: number;
    completed: number;
    completionRate: number;
  };
  mistakeCount: number;
  weakKnowledgePoints: Awaited<ReturnType<typeof getStudentKnowledgePointWeaknessStatsByStudentId>>;
  teacherComments: LearningReportTeacherComment[];
};

export function calculateLearningReportRates(input: {
  attendanceTotal: number;
  attendanceAttended: number;
  homeworkTotal: number;
  homeworkCompleted: number;
}) {
  return {
    attendanceRate:
      input.attendanceTotal > 0
        ? Math.round((input.attendanceAttended / input.attendanceTotal) * 100)
        : 0,
    homeworkCompletionRate:
      input.homeworkTotal > 0
        ? Math.round((input.homeworkCompleted / input.homeworkTotal) * 100)
        : 0,
  };
}

async function buildLearningReportForStudent(
  tenantId: string,
  student: ReportStudent,
): Promise<StudentLearningReport> {
  const [
    attendanceTotal,
    attendanceAttended,
    homeworkTotal,
    homeworkCompleted,
    mistakeCount,
    weakKnowledgePoints,
    teacherComments,
  ] = await Promise.all([
    prisma.attendance.count({
      where: {
        tenantId,
        studentId: student.id,
      },
    }),
    prisma.attendance.count({
      where: {
        tenantId,
        studentId: student.id,
        status: {
          in: attendedAttendanceStatuses,
        },
      },
    }),
    prisma.homeworkSubmission.count({
      where: {
        tenantId,
        studentId: student.id,
      },
    }),
    prisma.homeworkSubmission.count({
      where: {
        tenantId,
        studentId: student.id,
        status: "CORRECTED",
      },
    }),
    prisma.errorRecord.count({
      where: {
        tenantId,
        studentId: student.id,
      },
    }),
    getStudentKnowledgePointWeaknessStatsByStudentId(tenantId, student.id),
    prisma.lessonFeedback.findMany({
      where: {
        tenantId,
        studentId: student.id,
      },
      include: {
        lesson: true,
        teacher: true,
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 5,
    }),
  ]);
  const rates = calculateLearningReportRates({
    attendanceTotal,
    attendanceAttended,
    homeworkTotal,
    homeworkCompleted,
  });

  return {
    student,
    attendance: {
      total: attendanceTotal,
      attended: attendanceAttended,
      rate: rates.attendanceRate,
    },
    homework: {
      total: homeworkTotal,
      completed: homeworkCompleted,
      completionRate: rates.homeworkCompletionRate,
    },
    mistakeCount,
    weakKnowledgePoints,
    teacherComments: teacherComments.map((feedback) => ({
      id: feedback.id,
      lessonTitle: feedback.lesson.title,
      teacherName: feedback.teacher.name,
      content: feedback.content,
      performance: feedback.performance,
      mastery: feedback.mastery,
      homework: feedback.homework,
      suggestion: feedback.suggestion,
    })),
  };
}

export async function getStudentLearningReport(tenantId: string, userId: string) {
  const student = await prisma.studentProfile.findFirst({
    where: {
      tenantId,
      userId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!student) {
    return null;
  }

  return buildLearningReportForStudent(tenantId, student);
}

export async function getParentLearningReports(tenantId: string, parentUserId: string) {
  const students = await prisma.studentProfile.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
      guardians: {
        some: {
          guardian: {
            tenantId,
            userId: parentUserId,
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: [{ name: "asc" }],
  });

  return Promise.all(students.map((student) => buildLearningReportForStudent(tenantId, student)));
}
