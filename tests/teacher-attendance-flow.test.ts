import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const cuid = "cm00000000000000000000001";

describe("teacher attendance flow", () => {
  it("parses attendance form rows with validated statuses", async () => {
    const schemaPath = join(process.cwd(), "features/attendance/attendance-schema.ts");

    expect(existsSync(schemaPath)).toBe(true);
    if (!existsSync(schemaPath)) {
      return;
    }

    const schemaModulePath = "../features/attendance/attendance-schema";
    const { attendanceStatusValues, getAttendanceRecordFormValues } = (await import(
      /* @vite-ignore */ schemaModulePath
    )) as {
      attendanceStatusValues: string[];
      getAttendanceRecordFormValues: (formData: FormData) => {
        success: boolean;
        data?: unknown;
      };
    };
    const formData = new FormData();

    formData.set("scheduleId", cuid);
    formData.append("studentId", "cm00000000000000000000002");
    formData.append("studentId", "cm00000000000000000000003");
    formData.set("status:cm00000000000000000000002", "PRESENT");
    formData.set("status:cm00000000000000000000003", "LATE");
    formData.set("notes:cm00000000000000000000003", "迟到 5 分钟");

    expect(attendanceStatusValues).toEqual(["PRESENT", "LATE", "EXCUSED", "ABSENT", "MAKE_UP"]);
    expect(getAttendanceRecordFormValues(formData)).toMatchObject({
      success: true,
      data: {
        scheduleId: cuid,
        entries: [
          { studentId: "cm00000000000000000000002", status: "PRESENT", notes: undefined },
          { studentId: "cm00000000000000000000003", status: "LATE", notes: "迟到 5 分钟" },
        ],
      },
    });

    formData.set("status:cm00000000000000000000002", "UNKNOWN");
    expect(getAttendanceRecordFormValues(formData).success).toBe(false);
  });

  it("records attendance server-side with teacher scope, staff assist, transaction, and audit", () => {
    const actionPath = join(process.cwd(), "features/attendance/actions.ts");

    expect(existsSync(actionPath)).toBe(true);
    if (!existsSync(actionPath)) {
      return;
    }

    const source = readFileSync(actionPath, "utf8");

    expect(source).toContain("recordLessonAttendanceAction");
    expect(source).toContain('requirePermission("attendance:mutate"');
    expect(source).toContain('currentUser.roleKey === "TEACHER"');
    expect(source).toContain("schedule.teacher.userId !== currentUser.id");
    expect(source).toContain("prisma.$transaction");
    expect(source).toContain("tx.attendance.upsert");
    expect(source).toContain("writeAuditLog");
    expect(source).toContain("attendance.record");
  });

  it("renders teacher attendance forms from teacher-owned schedules", () => {
    const queryPath = join(process.cwd(), "features/attendance/queries.ts");
    const dashboardQueryPath = join(process.cwd(), "features/reports/teacher-class-dashboard.ts");
    const pagePath = join(process.cwd(), "app/(mobile)/teacher/page.tsx");

    expect(existsSync(queryPath)).toBe(true);
    expect(existsSync(dashboardQueryPath)).toBe(true);
    if (!existsSync(queryPath) || !existsSync(dashboardQueryPath)) {
      return;
    }

    const querySource = readFileSync(queryPath, "utf8");
    const dashboardQuerySource = readFileSync(dashboardQueryPath, "utf8");
    const pageSource = readFileSync(pagePath, "utf8");

    expect(querySource).toContain("getTeacherAttendanceSchedules");
    expect(querySource).toContain("teacher:");
    expect(querySource).toContain("userId");
    expect(querySource).toContain("attendances:");
    expect(dashboardQuerySource).toContain("getTeacherAttendanceSchedules");
    expect(pageSource).toContain("dashboard.pendingAttendance");
    expect(pageSource).toContain("AttendanceRosterForm");
  });
});
