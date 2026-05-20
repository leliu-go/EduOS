import { describe, expect, it, vi } from "vitest";

import { createCourseConsumptionForAttendance } from "@/features/course-consumptions/auto-consumption";
import { buildErrorReasonStats } from "@/features/mistakes/error-reason-stats";
import { buildKnowledgePointWeaknessStats } from "@/features/mistakes/weakness-stats";
import { getTeacherErrorRecordScope } from "@/features/mistakes/scopes";
import { findScheduleConflicts } from "@/features/scheduling/conflicts";
import { hasPermission } from "@/lib/rbac/permissions";

type ScheduleConflictClient = Parameters<typeof findScheduleConflicts>[0];
type CourseConsumptionClient = Parameters<typeof createCourseConsumptionForAttendance>[0];
type CourseConsumptionInput = Parameters<typeof createCourseConsumptionForAttendance>[1];

type CourseConsumptionCreateArgs = {
  data: {
    tenantId: string;
    scheduleId: string;
    attendanceId: string | null;
    studentId: string;
    courseProductId: string;
    courseAccountId: string;
    consumedHours: number;
    reason: string;
  };
};

function createScheduleConflictClient() {
  const captured: {
    classGroupStudentWhere?: unknown;
    campusWhere?: unknown;
    scheduleWhere?: unknown;
  } = {};

  const client: ScheduleConflictClient = {
    classGroupStudent: {
      findMany: async (args) => {
        captured.classGroupStudentWhere = args.where;

        return [
          {
            classGroupId: "class-1",
            studentId: "student-1",
          },
        ];
      },
    },
    campus: {
      findMany: async (args) => {
        captured.campusWhere = args.where;

        return [
          {
            id: "campus-1",
            name: "Main campus",
            businessHours: "08:00-20:00",
          },
        ];
      },
    },
    schedule: {
      findMany: async (args) => {
        captured.scheduleWhere = args.where;

        return [
          {
            id: "schedule-2",
            classGroupId: "class-2",
            teacherId: "teacher-2",
            roomId: "room-2",
            startAt: new Date("2026-05-20T08:00:00.000Z"),
            endAt: new Date("2026-05-20T09:00:00.000Z"),
            teacher: {
              name: "Teacher B",
            },
            room: {
              name: "Room B",
              campus: {
                name: "Main campus",
              },
            },
            classGroup: {
              name: "Class B",
              students: [
                {
                  studentId: "student-2",
                },
              ],
            },
          },
        ];
      },
    },
  };

  return { captured, client };
}

function createConsumptionInput(
  status: CourseConsumptionInput["attendance"]["status"],
): CourseConsumptionInput {
  return {
    tenantId: "tenant-1",
    actorUserId: "actor-1",
    schedule: {
      id: "schedule-1",
      startAt: new Date("2026-05-20T08:00:00.000Z"),
      endAt: new Date("2026-05-20T09:30:00.000Z"),
      classGroup: {
        courseProductId: "course-1",
      },
    },
    attendance: {
      id: "attendance-1",
      studentId: "student-1",
      status,
    },
  };
}

function createCourseConsumptionClient({
  account = { id: "account-1" },
  existingConsumption = null,
}: {
  account?: { id: string } | null;
  existingConsumption?: { id: string } | null;
} = {}) {
  const courseAccountFindFirst = vi.fn(async () => account);
  const courseAccountUpdate = vi.fn(async () => ({
    id: "account-1",
  }));
  const courseConsumptionFindUnique = vi.fn(async () => existingConsumption);
  const courseConsumptionCreate = vi.fn(async (args: CourseConsumptionCreateArgs) => ({
    id: "consumption-1",
    ...args.data,
  }));
  const auditLogCreate = vi.fn(async () => ({}));
  const client = {
    courseAccount: {
      findFirst: courseAccountFindFirst,
      update: courseAccountUpdate,
    },
    courseConsumption: {
      findUnique: courseConsumptionFindUnique,
      create: courseConsumptionCreate,
    },
    auditLog: {
      create: auditLogCreate,
    },
  } as unknown as CourseConsumptionClient;

  return {
    auditLogCreate,
    client,
    courseAccountFindFirst,
    courseAccountUpdate,
    courseConsumptionCreate,
    courseConsumptionFindUnique,
  };
}

describe("core business logic", () => {
  it("enforces role permissions for staff, finance, and mobile users", () => {
    expect(hasPermission("ORG_ADMIN", "students:manage")).toBe(true);
    expect(hasPermission("ORG_ADMIN", "finance:mutate")).toBe(true);
    expect(hasPermission("ORG_ADMIN", "route:student")).toBe(false);

    expect(hasPermission("FINANCE", "finance:mutate")).toBe(true);
    expect(hasPermission("FINANCE", "finance:reports:view")).toBe(true);
    expect(hasPermission("FINANCE", "students:manage")).toBe(false);
    expect(hasPermission("FINANCE", "classes:manage")).toBe(false);

    expect(hasPermission("TEACHER", "route:teacher")).toBe(true);
    expect(hasPermission("TEACHER", "finance:mutate")).toBe(false);
    expect(hasPermission("STUDENT", "route:student")).toBe(true);
    expect(hasPermission("STUDENT", "route:dashboard")).toBe(false);
    expect(hasPermission("PARENT", "route:parent")).toBe(true);
    expect(hasPermission("PARENT", "teachers:manage")).toBe(false);
    expect(hasPermission("UNKNOWN_ROLE", "route:dashboard")).toBe(false);
  });

  it("builds teacher mistake scopes with tenant and teacher ownership boundaries", () => {
    const scope = getTeacherErrorRecordScope("tenant-1", "teacher-user-1");
    const serializedScope = JSON.stringify(scope);

    expect(scope.tenantId).toBe("tenant-1");
    expect(scope.OR).toHaveLength(4);
    expect(serializedScope.match(/teacher-user-1/g)).toHaveLength(4);
    expect(serializedScope).toContain("primaryTeacher");
    expect(serializedScope).toContain("homeworkSubmission");
    expect(serializedScope).not.toContain("tenant-2");
    expect(serializedScope).not.toContain("teacher-user-2");
  });

  it("tenant-scopes schedule conflict queries and respects excluded schedules", async () => {
    const { captured, client } = createScheduleConflictClient();

    const conflicts = await findScheduleConflicts(
      client,
      "tenant-1",
      [
        {
          classGroupId: "class-1",
          teacherId: "teacher-1",
          roomId: "room-1",
          campusId: "campus-1",
          startAt: new Date("2026-05-20T09:00:00.000Z"),
          endAt: new Date("2026-05-20T10:00:00.000Z"),
        },
      ],
      {
        excludeScheduleIds: ["schedule-1"],
      },
    );

    expect(conflicts).toEqual([]);
    expect(captured.classGroupStudentWhere).toMatchObject({
      tenantId: "tenant-1",
      classGroupId: {
        in: ["class-1"],
      },
    });
    expect(captured.campusWhere).toMatchObject({
      tenantId: "tenant-1",
      id: {
        in: ["campus-1"],
      },
    });
    expect(captured.scheduleWhere).toMatchObject({
      tenantId: "tenant-1",
      id: {
        notIn: ["schedule-1"],
      },
      status: {
        in: ["SCHEDULED", "RESCHEDULED", "MAKE_UP"],
      },
    });
  });

  it("skips non-billable attendance without touching course accounts", async () => {
    const { client, courseAccountFindFirst, courseConsumptionCreate } =
      createCourseConsumptionClient();

    await expect(
      createCourseConsumptionForAttendance(client, createConsumptionInput("ABSENT")),
    ).resolves.toEqual({ status: "skipped" });
    expect(courseAccountFindFirst).not.toHaveBeenCalled();
    expect(courseConsumptionCreate).not.toHaveBeenCalled();
  });

  it("detects missing and duplicate course consumption records before mutation", async () => {
    const missingAccountClient = createCourseConsumptionClient({ account: null });

    await expect(
      createCourseConsumptionForAttendance(
        missingAccountClient.client,
        createConsumptionInput("PRESENT"),
      ),
    ).resolves.toEqual({ status: "missing_account" });
    expect(missingAccountClient.courseConsumptionFindUnique).not.toHaveBeenCalled();
    expect(missingAccountClient.courseConsumptionCreate).not.toHaveBeenCalled();

    const duplicateClient = createCourseConsumptionClient({
      existingConsumption: { id: "consumption-existing" },
    });

    await expect(
      createCourseConsumptionForAttendance(duplicateClient.client, createConsumptionInput("LATE")),
    ).resolves.toEqual({ status: "duplicate" });
    expect(duplicateClient.courseConsumptionCreate).not.toHaveBeenCalled();
    expect(duplicateClient.courseAccountUpdate).not.toHaveBeenCalled();
    expect(duplicateClient.auditLogCreate).not.toHaveBeenCalled();
  });

  it("creates course consumption, increments used hours, and writes an audit log", async () => {
    const {
      auditLogCreate,
      client,
      courseAccountFindFirst,
      courseAccountUpdate,
      courseConsumptionCreate,
      courseConsumptionFindUnique,
    } = createCourseConsumptionClient();

    const result = await createCourseConsumptionForAttendance(
      client,
      createConsumptionInput("MAKE_UP"),
    );

    expect(result.status).toBe("created");
    if (result.status === "created") {
      expect(result.consumption).toMatchObject({
        id: "consumption-1",
        tenantId: "tenant-1",
        scheduleId: "schedule-1",
        attendanceId: "attendance-1",
        studentId: "student-1",
        courseProductId: "course-1",
        courseAccountId: "account-1",
        consumedHours: 2,
        reason: "attendance_confirmed",
      });
    }
    expect(courseAccountFindFirst).toHaveBeenCalledWith({
      where: {
        tenantId: "tenant-1",
        studentId: "student-1",
        courseProductId: "course-1",
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });
    expect(courseConsumptionFindUnique).toHaveBeenCalledWith({
      where: {
        tenantId_scheduleId_studentId: {
          tenantId: "tenant-1",
          scheduleId: "schedule-1",
          studentId: "student-1",
        },
      },
      select: {
        id: true,
      },
    });
    expect(courseConsumptionCreate).toHaveBeenCalledWith({
      data: {
        tenantId: "tenant-1",
        scheduleId: "schedule-1",
        attendanceId: "attendance-1",
        studentId: "student-1",
        courseProductId: "course-1",
        courseAccountId: "account-1",
        consumedHours: 2,
        reason: "attendance_confirmed",
      },
    });
    expect(courseAccountUpdate).toHaveBeenCalledWith({
      where: {
        id: "account-1",
      },
      data: {
        usedHours: {
          increment: 2,
        },
      },
    });
    expect(auditLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: "tenant-1",
        actorUserId: "actor-1",
        action: "courseConsumption.create",
        entityType: "courseConsumption",
        entityId: "consumption-1",
        afterJson: expect.objectContaining({
          consumedHours: 2,
        }),
      }),
    });
  });

  it("builds mistake statistics with zero-filled reasons and sorted weaknesses", () => {
    const reasonStats = buildErrorReasonStats([
      {
        errorReason: "CARELESS",
        _count: {
          _all: 3,
        },
      },
    ]);

    expect(reasonStats.find((stat) => stat.reason === "CARELESS")?.count).toBe(3);
    expect(reasonStats.find((stat) => stat.reason === "CONCEPT_UNCLEAR")?.count).toBe(0);
    expect(reasonStats.find((stat) => stat.reason === "OTHER")?.count).toBe(0);

    const weaknessStats = buildKnowledgePointWeaknessStats(
      [
        {
          knowledgePointId: "kp-missing",
          _count: {
            _all: 9,
          },
        },
        {
          knowledgePointId: "kp-1",
          _count: {
            _all: 2,
          },
        },
        {
          knowledgePointId: "kp-2",
          _count: {
            _all: 5,
          },
        },
      ],
      [
        {
          id: "kp-1",
          name: "Linear equations",
          chapter: "Equations",
          subject: {
            name: "Math",
          },
          grade: {
            name: "Grade 7",
          },
          parent: null,
        },
        {
          id: "kp-2",
          name: "Moving terms",
          chapter: "Equations",
          subject: {
            name: "Math",
          },
          grade: {
            name: "Grade 7",
          },
          parent: {
            name: "Linear equations",
          },
        },
      ],
    );

    expect(
      weaknessStats.map((stat) => ({
        knowledgePointId: stat.knowledgePointId,
        count: stat.count,
      })),
    ).toEqual([
      {
        knowledgePointId: "kp-2",
        count: 5,
      },
      {
        knowledgePointId: "kp-1",
        count: 2,
      },
    ]);
    expect(weaknessStats[0]?.label).toContain("Math");
    expect(weaknessStats[0]?.label).toContain("Linear equations");
    expect(weaknessStats[0]?.label).toContain("Moving terms");
  });
});
