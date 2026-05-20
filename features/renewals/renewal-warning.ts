import { calculateCourseAccountBalance } from "@/features/course-accounts/balance";
import type { AttendanceStatus, Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type RenewalTrigger =
  | "LOW_BALANCE"
  | "NEAR_COURSE_END"
  | "LOW_ATTENDANCE"
  | "STRONG_PROGRESS";

export type RenewalPriority = "HIGH" | "MEDIUM";

export const renewalTriggerLabels = {
  LOW_BALANCE: "低课时",
  NEAR_COURSE_END: "临近结课",
  LOW_ATTENDANCE: "到课偏低",
  STRONG_PROGRESS: "成长良好",
} as const satisfies Record<RenewalTrigger, string>;

export const renewalPriorityLabels = {
  HIGH: "高优先级",
  MEDIUM: "常规跟进",
} as const satisfies Record<RenewalPriority, string>;

type RenewalWarningThresholds = {
  lowBalanceHours?: number;
  nearEndRatio?: number;
  lowAttendanceRate?: number;
  strongAttendanceRate?: number;
  strongHomeworkCompletionRate?: number;
  minAttendanceRecords?: number;
  minHomeworkRecords?: number;
};

export type RenewalFollowUpScope = RenewalWarningThresholds & {
  campusId?: string | null;
  today?: Date;
};

type RenewalTriggerInput = {
  remainingHours: number;
  totalHours: number;
  attendanceRate: number;
  attendanceTotal: number;
  homeworkCompletionRate: number;
  homeworkTotal: number;
};

const attendedStatuses: AttendanceStatus[] = ["PRESENT", "LATE", "MAKE_UP"];
const defaultThresholds = {
  lowBalanceHours: 4,
  nearEndRatio: 0.2,
  lowAttendanceRate: 70,
  strongAttendanceRate: 90,
  strongHomeworkCompletionRate: 90,
  minAttendanceRecords: 3,
  minHomeworkRecords: 3,
};

export function calculateRenewalRate(part: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

export function buildRenewalTriggers(
  input: RenewalTriggerInput,
  thresholds: RenewalWarningThresholds = {},
) {
  const options = {
    ...defaultThresholds,
    ...thresholds,
  };
  const triggers: RenewalTrigger[] = [];

  if (input.remainingHours <= options.lowBalanceHours) {
    triggers.push("LOW_BALANCE");
  }

  if (input.totalHours > 0 && input.remainingHours / input.totalHours <= options.nearEndRatio) {
    triggers.push("NEAR_COURSE_END");
  }

  if (
    input.attendanceTotal >= options.minAttendanceRecords &&
    input.attendanceRate < options.lowAttendanceRate
  ) {
    triggers.push("LOW_ATTENDANCE");
  }

  if (
    input.attendanceTotal >= options.minAttendanceRecords &&
    input.homeworkTotal >= options.minHomeworkRecords &&
    input.attendanceRate >= options.strongAttendanceRate &&
    input.homeworkCompletionRate >= options.strongHomeworkCompletionRate
  ) {
    triggers.push("STRONG_PROGRESS");
  }

  return triggers;
}

export async function getRenewalFollowUpList(tenantId: string, scope: RenewalFollowUpScope = {}) {
  const campusId = scope.campusId ?? null;
  const today = scope.today ?? new Date();
  const since = new Date(today);

  since.setDate(since.getDate() - 30);
  since.setHours(0, 0, 0, 0);

  const courseAccountCampusWhere: Prisma.CourseAccountWhereInput = campusId
    ? {
        enrollments: {
          some: {
            classGroup: {
              is: {
                campusId,
              },
            },
          },
        },
      }
    : {};
  const attendanceCampusWhere: Prisma.AttendanceWhereInput = campusId
    ? {
        schedule: {
          campusId,
        },
      }
    : {};
  const homeworkSubmissionCampusWhere: Prisma.HomeworkSubmissionWhereInput = campusId
    ? {
        homework: {
          OR: [
            {
              classGroup: {
                is: {
                  campusId,
                },
              },
            },
            {
              lesson: {
                is: {
                  classGroup: {
                    campusId,
                  },
                },
              },
            },
          ],
        },
      }
    : {};

  const accounts = await prisma.courseAccount.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
      ...courseAccountCampusWhere,
    },
    include: {
      student: true,
      courseProduct: {
        include: {
          subject: true,
          grade: true,
        },
      },
      enrollments: {
        include: {
          classGroup: {
            include: {
              campus: true,
            },
          },
        },
        orderBy: [{ enrolledAt: "desc" }],
        take: 1,
      },
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 200,
  });
  const studentIds = [...new Set(accounts.map((account) => account.studentId))];

  if (studentIds.length === 0) {
    return [];
  }

  const [attendanceRows, homeworkRows] = await Promise.all([
    prisma.attendance.findMany({
      where: {
        tenantId,
        studentId: {
          in: studentIds,
        },
        createdAt: {
          gte: since,
        },
        ...attendanceCampusWhere,
      },
      select: {
        studentId: true,
        status: true,
      },
    }),
    prisma.homeworkSubmission.findMany({
      where: {
        tenantId,
        studentId: {
          in: studentIds,
        },
        submittedAt: {
          gte: since,
        },
        ...homeworkSubmissionCampusWhere,
      },
      select: {
        studentId: true,
        status: true,
      },
    }),
  ]);

  const attendanceStats = new Map<string, { attended: number; total: number }>();
  const homeworkStats = new Map<string, { completed: number; total: number }>();

  for (const row of attendanceRows) {
    const current = attendanceStats.get(row.studentId) ?? { attended: 0, total: 0 };

    current.total += 1;
    current.attended += attendedStatuses.includes(row.status) ? 1 : 0;
    attendanceStats.set(row.studentId, current);
  }

  for (const row of homeworkRows) {
    const current = homeworkStats.get(row.studentId) ?? { completed: 0, total: 0 };

    current.total += 1;
    current.completed += row.status === "CORRECTED" ? 1 : 0;
    homeworkStats.set(row.studentId, current);
  }

  return accounts
    .flatMap((account) => {
      const balance = calculateCourseAccountBalance(account);
      const attendance = attendanceStats.get(account.studentId) ?? { attended: 0, total: 0 };
      const homework = homeworkStats.get(account.studentId) ?? { completed: 0, total: 0 };
      const attendanceRate = calculateRenewalRate(attendance.attended, attendance.total);
      const homeworkCompletionRate = calculateRenewalRate(homework.completed, homework.total);
      const triggers = buildRenewalTriggers(
        {
          remainingHours: balance.remainingHours,
          totalHours: balance.totalHours,
          attendanceRate,
          attendanceTotal: attendance.total,
          homeworkCompletionRate,
          homeworkTotal: homework.total,
        },
        scope,
      );

      if (triggers.length === 0) {
        return [];
      }

      const priority: RenewalPriority =
        triggers.includes("LOW_BALANCE") || triggers.includes("LOW_ATTENDANCE") ? "HIGH" : "MEDIUM";
      const enrollment = account.enrollments[0];

      return [
        {
          id: account.id,
          student: account.student,
          courseProduct: account.courseProduct,
          classGroup: enrollment?.classGroup ?? null,
          campus: enrollment?.classGroup?.campus ?? null,
          balance,
          attendanceRate,
          attendanceTotal: attendance.total,
          homeworkCompletionRate,
          homeworkTotal: homework.total,
          triggers,
          priority,
        },
      ];
    })
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority === "HIGH" ? -1 : 1;
      }

      return left.balance.remainingHours - right.balance.remainingHours;
    });
}
