import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  lessonDataSchema,
  scheduleChangeLogDataSchema,
  scheduleDataSchema,
} from "../features/scheduling/schedule-schema";

describe("schedule data model", () => {
  it("adds tenant-scoped Lesson, Schedule, and ScheduleChangeLog models", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("model Lesson");
    expect(schema).toContain("model Schedule");
    expect(schema).toContain("model ScheduleChangeLog");
    expect(schema).toMatch(/lessons\s+Lesson\[\]/);
    expect(schema).toMatch(/schedules\s+Schedule\[\]/);
    expect(schema).toMatch(/scheduleChangeLogs\s+ScheduleChangeLog\[\]/);
    expect(schema).toMatch(/classGroupId\s+String/);
    expect(schema).toMatch(/teacherId\s+String/);
    expect(schema).toMatch(/campusId\s+String/);
    expect(schema).toMatch(/roomId\s+String/);
    expect(schema).toMatch(/lessonId\s+String\?/);
    expect(schema).toMatch(/startAt\s+DateTime/);
    expect(schema).toMatch(/endAt\s+DateTime/);
    expect(schema).toMatch(/status\s+ScheduleStatus/);
    expect(schema).toMatch(/recurrenceRule\s+String\?/);
    expect(schema).toMatch(/sourceScheduleId\s+String\?/);
    expect(schema).toContain("@@index([tenantId, startAt])");
    expect(schema).toContain("@@index([tenantId, status])");
  });

  it("has explicit statuses and change types for scheduling operations", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("enum ScheduleStatus");
    expect(schema).toContain("SCHEDULED");
    expect(schema).toContain("RESCHEDULED");
    expect(schema).toContain("CANCELLED");
    expect(schema).toContain("MAKE_UP");
    expect(schema).toContain("enum ScheduleChangeType");
    expect(schema).toContain("CREATE");
    expect(schema).toContain("RESCHEDULE");
    expect(schema).toContain("CANCEL");
  });

  it("validates schedule-related data shapes", () => {
    expect(() =>
      lessonDataSchema.parse({
        classGroupId: "cm00000000000000000000001",
        teacherId: "cm00000000000000000000002",
        title: "函数专题",
        status: "PLANNED",
      }),
    ).not.toThrow();
    expect(() =>
      scheduleDataSchema.parse({
        classGroupId: "cm00000000000000000000001",
        teacherId: "cm00000000000000000000002",
        campusId: "cm00000000000000000000003",
        roomId: "cm00000000000000000000004",
        lessonId: "cm00000000000000000000005",
        startAt: "2026-09-01T10:00:00.000Z",
        endAt: "2026-09-01T12:00:00.000Z",
        status: "SCHEDULED",
        recurrenceRule: "FREQ=WEEKLY;COUNT=8",
        sourceScheduleId: "",
      }),
    ).not.toThrow();
    expect(() =>
      scheduleChangeLogDataSchema.parse({
        scheduleId: "cm00000000000000000000006",
        changeType: "RESCHEDULE",
        reason: "老师请假",
      }),
    ).not.toThrow();

    expect(() =>
      scheduleDataSchema.parse({
        classGroupId: "cm00000000000000000000001",
        teacherId: "cm00000000000000000000002",
        campusId: "cm00000000000000000000003",
        roomId: "cm00000000000000000000004",
        lessonId: "",
        startAt: "2026-09-01T12:00:00.000Z",
        endAt: "2026-09-01T10:00:00.000Z",
        status: "SCHEDULED",
        recurrenceRule: "",
        sourceScheduleId: "",
      }),
    ).toThrow();
  });
});
