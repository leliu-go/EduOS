import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  canViewActivityProgress,
  createWordCheckinActivityDraft,
  publishActivity,
  recordWordCheckinAttempt,
} from "../../features/activities/activity-engine";

const admin = {
  tenantId: "tenant-a",
  roleKey: "ORG_ADMIN",
  userId: "admin-a",
} as const;

const teacher = {
  tenantId: "tenant-a",
  roleKey: "TEACHER",
  userId: "teacher-a",
} as const;

const student = {
  tenantId: "tenant-a",
  roleKey: "STUDENT",
  userId: "student-a",
} as const;

const activityInput = {
  title: "Unit 1 word check-in",
  description: "Daily words",
  type: "WORD_CHECKIN",
  status: "DRAFT",
  startsAt: "2026-05-21",
  endsAt: "2026-05-28",
  assignment: {
    targetType: "CAMPUS",
    campusId: "clxcampus000000000000001",
  },
  config: {
    targetWordCount: 120,
    dailyCheckInLimit: 1,
    wordListResourceId: "clxresource00000000000001",
  },
};

describe("Activity Engine WORD_CHECKIN stage", () => {
  it("lets admins create a tenant-scoped word check-in activity with campus assignment", () => {
    const draft = createWordCheckinActivityDraft(admin, activityInput);

    expect(draft).toMatchObject({
      tenantId: "tenant-a",
      type: "WORD_CHECKIN",
      targetWordCount: 120,
      wordListResourceId: "clxresource00000000000001",
      assignment: {
        targetType: "CAMPUS",
      },
    });
  });

  it("does not let teachers create tenant-wide activities", () => {
    expect(() => createWordCheckinActivityDraft(teacher, activityInput)).toThrow(
      "Actor cannot manage activities",
    );
  });

  it("lets authorized managers publish draft activities", () => {
    const result = publishActivity(admin, {
      tenantId: "tenant-a",
      status: "DRAFT",
    });

    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(result.status).toBe("PUBLISHED");
      expect(result.publishedAt).toBeInstanceOf(Date);
    }
  });

  it("allows only assigned students to check in and enforces daily limits", () => {
    const activity = {
      tenantId: "tenant-a",
      status: "PUBLISHED" as const,
      assignedStudentUserIds: ["student-a"],
      targetWordCount: 120,
      dailyCheckInLimit: 1,
    };

    expect(
      recordWordCheckinAttempt(
        student,
        activity,
        {
          activityId: "clxactivity00000000000001",
          checkedWordCount: 30,
        },
        0,
      ),
    ).toMatchObject({
      allowed: true,
      checkedWordCount: 30,
      progress: {
        remainingWordCount: 90,
      },
    });

    expect(
      recordWordCheckinAttempt(
        student,
        activity,
        {
          activityId: "clxactivity00000000000001",
          checkedWordCount: 30,
        },
        1,
      ),
    ).toEqual({
      allowed: false,
      reason: "daily_limit_reached",
    });
  });

  it("lets teachers view progress only for assigned classes", () => {
    expect(
      canViewActivityProgress(teacher, {
        tenantId: "tenant-a",
        status: "PUBLISHED",
        teacherUserIds: ["teacher-a"],
      }),
    ).toBe(true);

    expect(
      canViewActivityProgress(teacher, {
        tenantId: "tenant-a",
        status: "PUBLISHED",
        teacherUserIds: ["teacher-b"],
      }),
    ).toBe(false);
  });

  it("keeps activity mutations behind server-side permission checks and audit logs", () => {
    const actions = readFileSync("features/activities/actions.ts", "utf8");

    expect(actions).toContain('requirePermission("activities:manage"');
    expect(actions).toContain('requirePermission("activities:checkIn"');
    expect(actions).toContain("writeAuditLog");
    expect(actions).toContain('tenantId: currentUser.tenantId');
  });
});
