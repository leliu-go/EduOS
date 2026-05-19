import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("attendance data model", () => {
  it("adds tenant-scoped Attendance and CheckIn models", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("model Attendance");
    expect(schema).toContain("model CheckIn");
    expect(schema).toMatch(/attendances\s+Attendance\[\]/);
    expect(schema).toMatch(/checkIns\s+CheckIn\[\]/);
    expect(schema).toMatch(/tenantId\s+String/);
    expect(schema).toMatch(/scheduleId\s+String/);
    expect(schema).toMatch(/studentId\s+String/);
    expect(schema).toMatch(/status\s+AttendanceStatus/);
    expect(schema).toMatch(/checkedInAt\s+DateTime/);
    expect(schema).toMatch(/confirmedAt\s+DateTime\?/);
  });

  it("defines attendance statuses and prevents duplicate lesson attendance", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("enum AttendanceStatus");
    expect(schema).toContain("PRESENT");
    expect(schema).toContain("LATE");
    expect(schema).toContain("EXCUSED");
    expect(schema).toContain("ABSENT");
    expect(schema).toContain("MAKE_UP");
    expect(schema).toContain("@@unique([tenantId, scheduleId, studentId])");
    expect(schema).toContain("@@index([tenantId, status])");
  });
});
