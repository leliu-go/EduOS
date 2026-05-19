import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const cuid = "cm00000000000000000000001";

describe("student check-in flow", () => {
  it("parses student check-in and confirmation forms", async () => {
    const { getCheckInConfirmFormValues, getStudentCheckInFormValues } =
      (await import("../features/attendance/attendance-schema")) as {
        getStudentCheckInFormValues?: (formData: FormData) => { success: boolean; data?: unknown };
        getCheckInConfirmFormValues?: (formData: FormData) => { success: boolean; data?: unknown };
      };
    const checkInFormData = new FormData();
    const confirmFormData = new FormData();

    expect(getStudentCheckInFormValues).toBeTypeOf("function");
    expect(getCheckInConfirmFormValues).toBeTypeOf("function");

    checkInFormData.set("scheduleId", cuid);
    confirmFormData.set("checkInId", cuid);

    expect(getStudentCheckInFormValues?.(checkInFormData)).toMatchObject({
      success: true,
      data: { scheduleId: cuid },
    });
    expect(getCheckInConfirmFormValues?.(confirmFormData)).toMatchObject({
      success: true,
      data: { checkInId: cuid },
    });
  });

  it("records student check-in only for the current student's today lesson", () => {
    const source = readFileSync(join(process.cwd(), "features/attendance/actions.ts"), "utf8");

    expect(source).toContain("createStudentCheckInAction");
    expect(source).toContain('requirePermission("route:student"');
    expect(source).toContain("getStudentCheckInFormValues");
    expect(source).toContain("startOfDay");
    expect(source).toContain("endOfDay");
    expect(source).toContain("userId: currentUser.id");
    expect(source).toContain("tx.checkIn.upsert");
    expect(source).toContain("checkedInAt");
    expect(source).not.toContain('formData.get("studentId")');
  });

  it("confirms check-in by teacher scope or authorized staff", () => {
    const source = readFileSync(join(process.cwd(), "features/attendance/actions.ts"), "utf8");

    expect(source).toContain("confirmStudentCheckInAction");
    expect(source).toContain("getCheckInConfirmFormValues");
    expect(source).toContain('requirePermission("attendance:mutate"');
    expect(source).toContain('currentUser.roleKey === "TEACHER"');
    expect(source).toContain("checkIn.schedule.teacher.userId !== currentUser.id");
    expect(source).toContain("confirmedAt");
    expect(source).toContain("confirmedByUserId");
    expect(source).toContain("checkIn.confirm");
  });

  it("renders student check-in cards and teacher confirmation controls", () => {
    const querySource = readFileSync(join(process.cwd(), "features/attendance/queries.ts"), "utf8");
    const studentPage = readFileSync(join(process.cwd(), "app/(mobile)/student/page.tsx"), "utf8");
    const rosterForm = readFileSync(
      join(process.cwd(), "features/attendance/attendance-roster-form.tsx"),
      "utf8",
    );

    expect(querySource).toContain("getStudentCheckInSchedules");
    expect(querySource).toContain("classGroup:");
    expect(querySource).toContain("userId");
    expect(querySource).toContain("checkIns:");
    expect(studentPage).toContain("getStudentCheckInSchedules");
    expect(studentPage).toContain("StudentCheckInCard");
    expect(rosterForm).toContain("confirmStudentCheckInAction");
  });
});
