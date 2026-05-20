import type { AttendanceStatus, Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const attendedStatuses: AttendanceStatus[] = ["PRESENT", "LATE", "MAKE_UP"];
const defaultLowBalanceThresholdHours = 4;

export type PrincipalDashboardScope = {
  campusId?: string | null;
  lowBalanceThresholdHours?: number;
  today?: Date;
};

type CourseAccountHourBalance = {
  purchasedHours: number | null;
  giftHours: number | null;
  usedHours: number | null;
  frozenHours: number | null;
};

export function getPrincipalDashboardDateRange(today = new Date()) {
  const startAt = new Date(today);

  startAt.setDate(1);
  startAt.setHours(0, 0, 0, 0);

  const endAt = new Date(startAt);

  endAt.setMonth(endAt.getMonth() + 1);

  return { startAt, endAt };
}

export function calculateDashboardRate(part: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

export function calculateRemainingLiabilityHours(input: CourseAccountHourBalance) {
  return Math.max(
    (input.purchasedHours ?? 0) +
      (input.giftHours ?? 0) -
      (input.usedHours ?? 0) -
      (input.frozenHours ?? 0),
    0,
  );
}

export async function getPrincipalDashboard(tenantId: string, scope: PrincipalDashboardScope = {}) {
  const campusId = scope.campusId ?? null;
  const lowBalanceThresholdHours =
    scope.lowBalanceThresholdHours ?? defaultLowBalanceThresholdHours;
  const range = getPrincipalDashboardDateRange(scope.today);
  const periodWhere = {
    createdAt: {
      gte: range.startAt,
      lt: range.endAt,
    },
  };
  const studentCampusWhere: Prisma.StudentProfileWhereInput = campusId
    ? {
        OR: [
          {
            classGroups: {
              some: {
                classGroup: {
                  campusId,
                },
              },
            },
          },
          {
            enrollments: {
              some: {
                classGroup: {
                  is: {
                    campusId,
                  },
                },
              },
            },
          },
        ],
      }
    : {};
  const enrollmentCampusWhere: Prisma.EnrollmentWhereInput = campusId
    ? {
        classGroup: {
          is: {
            campusId,
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
  const consumptionCampusWhere: Prisma.CourseConsumptionWhereInput = campusId
    ? {
        schedule: {
          campusId,
        },
      }
    : {};
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

  const [
    activeStudents,
    newEnrollments,
    attendanceTotal,
    attendanceAttended,
    courseConsumption,
    courseAccountLiability,
    activeCourseAccounts,
    pendingHomework,
  ] = await Promise.all([
    prisma.studentProfile.count({
      where: {
        tenantId,
        status: "ACTIVE",
        ...studentCampusWhere,
      },
    }),
    prisma.enrollment.count({
      where: {
        tenantId,
        ...periodWhere,
        ...enrollmentCampusWhere,
      },
    }),
    prisma.attendance.count({
      where: {
        tenantId,
        ...periodWhere,
        ...attendanceCampusWhere,
      },
    }),
    prisma.attendance.count({
      where: {
        tenantId,
        status: {
          in: attendedStatuses,
        },
        ...periodWhere,
        ...attendanceCampusWhere,
      },
    }),
    prisma.courseConsumption.aggregate({
      where: {
        tenantId,
        reversedAt: null,
        ...periodWhere,
        ...consumptionCampusWhere,
      },
      _sum: {
        consumedHours: true,
      },
    }),
    prisma.courseAccount.aggregate({
      where: {
        tenantId,
        status: "ACTIVE",
        ...courseAccountCampusWhere,
      },
      _sum: {
        purchasedHours: true,
        giftHours: true,
        usedHours: true,
        frozenHours: true,
      },
    }),
    prisma.courseAccount.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
        ...courseAccountCampusWhere,
      },
      select: {
        purchasedHours: true,
        giftHours: true,
        usedHours: true,
        frozenHours: true,
      },
    }),
    prisma.homeworkSubmission.count({
      where: {
        tenantId,
        status: "PENDING_CORRECTION",
        ...homeworkSubmissionCampusWhere,
      },
    }),
  ]);

  const remainingLiabilityHours = calculateRemainingLiabilityHours({
    purchasedHours: courseAccountLiability._sum.purchasedHours,
    giftHours: courseAccountLiability._sum.giftHours,
    usedHours: courseAccountLiability._sum.usedHours,
    frozenHours: courseAccountLiability._sum.frozenHours,
  });
  const lowBalanceWarnings = activeCourseAccounts.filter(
    (account) => calculateRemainingLiabilityHours(account) <= lowBalanceThresholdHours,
  ).length;

  return {
    scope: {
      tenantId,
      campusId,
    },
    period: range,
    activeStudents,
    newEnrollments,
    attendanceRate: calculateDashboardRate(attendanceAttended, attendanceTotal),
    attendanceAttended,
    attendanceTotal,
    courseConsumptionHours: courseConsumption._sum.consumedHours ?? 0,
    remainingLiabilityHours,
    pendingHomework,
    lowBalanceWarnings,
  };
}
