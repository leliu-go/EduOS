import { describe, expect, it } from "vitest";

import {
  activityCreateSchema,
  wordCheckinActivityConfigSchema,
  wordCheckinSubmissionSchema,
} from "../features/activities/activity-schema";
import {
  canAttachResourceToActivity,
  canSubmitWordCheckIn,
  canUseActivityResource,
  canViewActivity,
} from "../features/activities/activity-policy";
import { calculateWordCheckinProgress } from "../features/activities/word-checkin";

const classGroupId = "clxclassgroup0000000000001";
const resourceId = "clxresource00000000000001";
const studentId = "clxstudent000000000000001";

const adminActor = {
  tenantId: "tenant_1",
  roleKey: "ORG_ADMIN",
  userId: "admin_1",
} as const;

const campusActor = {
  tenantId: "tenant_1",
  roleKey: "CAMPUS_ADMIN",
  userId: "campus_1",
} as const;

const teacherActor = {
  tenantId: "tenant_1",
  roleKey: "TEACHER",
  userId: "teacher_1",
} as const;

const studentActor = {
  tenantId: "tenant_1",
  roleKey: "STUDENT",
  userId: "student_user_1",
} as const;

const otherStudentActor = {
  tenantId: "tenant_1",
  roleKey: "STUDENT",
  userId: "student_user_2",
} as const;

const parentActor = {
  tenantId: "tenant_1",
  roleKey: "PARENT",
  userId: "parent_user_1",
} as const;

const financeActor = {
  tenantId: "tenant_1",
  roleKey: "FINANCE",
  userId: "finance_1",
} as const;

const publishedActivity = {
  tenantId: "tenant_1",
  status: "PUBLISHED",
  teacherUserIds: ["teacher_1"],
  assignedStudentUserIds: ["student_user_1"],
  assignedGuardianUserIds: ["parent_user_1"],
} as const;

const draftActivity = {
  ...publishedActivity,
  status: "DRAFT",
} as const;

const resource = {
  tenantId: "tenant_1",
  ownerTeacherUserId: "teacher_1",
  studentUserIds: ["student_user_1"],
  guardianUserIds: ["parent_user_1"],
  guardianStudentUserIds: ["student_user_1"],
} as const;

describe("Activity Engine schemas", () => {
  it("validates WORD_CHECKIN activity configuration", () => {
    expect(
      wordCheckinActivityConfigSchema.parse({
        targetWordCount: "80",
        dailyCheckInLimit: "1",
        wordListResourceId: resourceId,
        instructions: "Review and check in after practice.",
      }),
    ).toMatchObject({
      targetWordCount: 80,
      dailyCheckInLimit: 1,
      wordListResourceId: resourceId,
    });

    expect(() =>
      wordCheckinActivityConfigSchema.parse({
        targetWordCount: 0,
        dailyCheckInLimit: 1,
      }),
    ).toThrow();
  });

  it("requires exactly one activity assignment target", () => {
    const baseActivity = {
      title: "Unit 1 words",
      type: "WORD_CHECKIN",
      status: "PUBLISHED",
      startsAt: "2026-05-21",
      endsAt: "2026-05-28",
      config: {
        targetWordCount: 80,
        dailyCheckInLimit: 1,
        wordListResourceId: resourceId,
      },
    };

    expect(
      activityCreateSchema.parse({
        ...baseActivity,
        assignment: {
          targetType: "CLASS_GROUP",
          classGroupId,
        },
      }),
    ).toMatchObject({
      type: "WORD_CHECKIN",
      assignment: {
        targetType: "CLASS_GROUP",
        classGroupId,
      },
    });

    expect(() =>
      activityCreateSchema.parse({
        ...baseActivity,
        assignment: {
          targetType: "STUDENT",
          studentId,
        },
        endsAt: "2026-05-20",
      }),
    ).toThrow();
  });

  it("validates word check-in submissions and progress", () => {
    expect(
      wordCheckinSubmissionSchema.parse({
        activityId: "clxactivity00000000000001",
        checkedWordCount: "30",
        note: "Finished today.",
      }),
    ).toMatchObject({
      checkedWordCount: 30,
    });

    expect(calculateWordCheckinProgress({ targetWordCount: 80, checkedWordCount: 120 })).toEqual({
      checkedWordCount: 80,
      remainingWordCount: 0,
      completionRate: 1,
    });
  });
});

describe("Activity Engine policy", () => {
  it("keeps activity visibility tenant-scoped and role-scoped", () => {
    expect(canViewActivity(adminActor, publishedActivity)).toBe(true);
    expect(canViewActivity(teacherActor, publishedActivity)).toBe(true);
    expect(canViewActivity(studentActor, publishedActivity)).toBe(true);
    expect(canViewActivity(parentActor, publishedActivity)).toBe(true);
    expect(canViewActivity(otherStudentActor, publishedActivity)).toBe(false);
    expect(canViewActivity(studentActor, draftActivity)).toBe(false);
    expect(
      canViewActivity(
        {
          ...adminActor,
          tenantId: "tenant_2",
        },
        publishedActivity,
      ),
    ).toBe(false);
  });

  it("allows only assigned students to submit WORD_CHECKIN check-ins", () => {
    expect(canSubmitWordCheckIn(studentActor, publishedActivity)).toBe(true);
    expect(canSubmitWordCheckIn(otherStudentActor, publishedActivity)).toBe(false);
    expect(canSubmitWordCheckIn(parentActor, publishedActivity)).toBe(false);
    expect(canSubmitWordCheckIn(teacherActor, publishedActivity)).toBe(false);
    expect(canSubmitWordCheckIn(studentActor, draftActivity)).toBe(false);
  });

  it("keeps activity management out of teacher, student, parent, and finance roles", () => {
    expect(canAttachResourceToActivity(adminActor, resource)).toBe(true);
    expect(canAttachResourceToActivity(campusActor, resource)).toBe(true);
    expect(canAttachResourceToActivity(teacherActor, resource)).toBe(false);
    expect(canAttachResourceToActivity(studentActor, resource)).toBe(false);
    expect(canAttachResourceToActivity(parentActor, resource)).toBe(false);
    expect(canAttachResourceToActivity(financeActor, resource)).toBe(false);
  });

  it("requires both activity visibility and resource authorization before resource use", () => {
    expect(canUseActivityResource(studentActor, publishedActivity, resource)).toBe(true);
    expect(canUseActivityResource(parentActor, publishedActivity, resource)).toBe(true);
    expect(canUseActivityResource(otherStudentActor, publishedActivity, resource)).toBe(false);
    expect(canUseActivityResource(studentActor, draftActivity, resource)).toBe(false);
    expect(
      canUseActivityResource(studentActor, publishedActivity, {
        ...resource,
        tenantId: "tenant_2",
      }),
    ).toBe(false);
  });
});
