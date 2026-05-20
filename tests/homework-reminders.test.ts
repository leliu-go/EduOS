import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("homework reminders", () => {
  it("classifies pending and overdue homework that still needs student action", async () => {
    const modulePath = "../features/homework/reminders";
    const { getHomeworkReminderStatus } = (await import(/* @vite-ignore */ modulePath)) as {
      getHomeworkReminderStatus: (
        input: { dueAt: Date; needsStudentAction: boolean },
        now: Date,
      ) => "OVERDUE" | "PENDING" | null;
    };
    const now = new Date("2026-05-20T12:00:00.000Z");

    expect(
      getHomeworkReminderStatus(
        { dueAt: new Date("2026-05-20T08:00:00.000Z"), needsStudentAction: true },
        now,
      ),
    ).toBe("OVERDUE");
    expect(
      getHomeworkReminderStatus(
        { dueAt: new Date("2026-05-21T08:00:00.000Z"), needsStudentAction: true },
        now,
      ),
    ).toBe("PENDING");
    expect(
      getHomeworkReminderStatus(
        { dueAt: new Date("2026-05-20T08:00:00.000Z"), needsStudentAction: false },
        now,
      ),
    ).toBeNull();
  });

  it("queries student and parent reminders with tenant and guardian scope", () => {
    const source = readFileSync(join(process.cwd(), "features/homework/queries.ts"), "utf8");

    expect(source).toContain("getStudentHomeworkReminders");
    expect(source).toContain("getParentHomeworkReminders");
    expect(source).toContain("getHomeworkReminderStatus");
    expect(source).toContain("needsStudentAction");
    expect(source).toContain("guardians");
    expect(source).toContain("parentUserId");
    expect(source).toContain("tenantId");
  });

  it("queries teacher not-submitted homework for the teacher's own scope", () => {
    const source = readFileSync(join(process.cwd(), "features/homework/queries.ts"), "utf8");

    expect(source).toContain("getTeacherNotSubmittedHomework");
    expect(source).toContain("getTeacherHomeworkWhere");
    expect(source).toContain("classGroup");
    expect(source).toContain("lesson");
    expect(source).toContain("submissions");
    expect(source).toContain("studentId");
  });

  it("renders reminders for student, parent, and teacher portals", () => {
    const studentPage = readFileSync(
      join(process.cwd(), "app/(mobile)/student/homework/page.tsx"),
      "utf8",
    );
    const parentPage = readFileSync(join(process.cwd(), "app/(mobile)/parent/page.tsx"), "utf8");
    const teacherPage = readFileSync(
      join(process.cwd(), "app/(mobile)/teacher/homework/page.tsx"),
      "utf8",
    );

    expect(studentPage).toContain("getStudentHomeworkReminders");
    expect(studentPage).toContain("作业提醒");
    expect(parentPage).toContain("getParentHomeworkReminders");
    expect(parentPage).toContain("作业提醒");
    expect(teacherPage).toContain("getTeacherNotSubmittedHomework");
    expect(teacherPage).toContain("未提交名单");
  });
});
