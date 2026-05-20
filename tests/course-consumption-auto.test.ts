import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("automatic course consumption", () => {
  it("adds a tenant-scoped CourseConsumption ledger with duplicate protection", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("model CourseConsumption");
    expect(schema).toMatch(/courseConsumptions\s+CourseConsumption\[\]/);
    expect(schema).toMatch(/courseAccountId\s+String/);
    expect(schema).toMatch(/attendanceId\s+String\?/);
    expect(schema).toMatch(/consumedHours\s+Int/);
    expect(schema).toContain("@@unique([tenantId, scheduleId, studentId])");
    expect(schema).toContain("@@index([tenantId, studentId])");
    expect(schema).toContain("@@index([tenantId, courseAccountId])");
  });

  it("calculates consumed hours from lesson duration", async () => {
    const helperPath = join(process.cwd(), "features/course-consumptions/auto-consumption.ts");

    expect(existsSync(helperPath)).toBe(true);
    if (!existsSync(helperPath)) {
      return;
    }

    const modulePath = "../features/course-consumptions/auto-consumption";
    const { calculateScheduleConsumedHours } = (await import(/* @vite-ignore */ modulePath)) as {
      calculateScheduleConsumedHours: (schedule: { startAt: Date; endAt: Date }) => number;
    };

    expect(
      calculateScheduleConsumedHours({
        startAt: new Date("2026-05-20T08:00:00.000Z"),
        endAt: new Date("2026-05-20T10:00:00.000Z"),
      }),
    ).toBe(2);
    expect(
      calculateScheduleConsumedHours({
        startAt: new Date("2026-05-20T08:00:00.000Z"),
        endAt: new Date("2026-05-20T09:30:00.000Z"),
      }),
    ).toBe(2);
  });

  it("creates consumption and increments course account inside the transaction", () => {
    const helperPath = join(process.cwd(), "features/course-consumptions/auto-consumption.ts");

    expect(existsSync(helperPath)).toBe(true);
    if (!existsSync(helperPath)) {
      return;
    }

    const source = readFileSync(helperPath, "utf8");

    expect(source).toContain("createCourseConsumptionForAttendance");
    expect(source).toContain("tx.courseConsumption.findUnique");
    expect(source).toContain("tx.courseConsumption.create");
    expect(source).toContain("tx.courseAccount.update");
    expect(source).toContain("usedHours");
    expect(source).toContain("writeAuditLog");
    expect(source).toContain("courseConsumption.create");
  });

  it("triggers automatic consumption after confirmed attendance", () => {
    const source = readFileSync(join(process.cwd(), "features/attendance/actions.ts"), "utf8");

    expect(source).toContain("createCourseConsumptionForAttendance");
    expect(source).toContain("courseProductId: true");
    expect(source).toContain("startAt: schedule.startAt");
    expect(source).toContain("status: attendance.status");
  });
});
