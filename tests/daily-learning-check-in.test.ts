import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("daily learning check-in", () => {
  it("keeps tenant-scoped daily learning task and check-in models", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("enum LearningTaskType");
    expect(schema).toContain("READING");
    expect(schema).toContain("MEMORIZATION");
    expect(schema).toContain("PRACTICE");
    expect(schema).toContain("SPECIAL_TRAINING");
    expect(schema).toContain("model LearningTask");
    expect(schema).toContain("model LearningTaskCheckIn");
    expect(schema).toMatch(/LearningTask[\s\S]*tenantId\s+String/);
    expect(schema).toMatch(/LearningTaskCheckIn[\s\S]*tenantId\s+String/);
    expect(schema).toContain("@@unique([tenantId, taskId, studentId])");
  });

  it("uses learning task labels that match student-facing word, reading, and listening habits", () => {
    const source = readFileSync(join(process.cwd(), "features/learning/learning-schema.ts"), "utf8");

    expect(source).toContain("单词打卡");
    expect(source).toContain("每日阅读");
    expect(source).toContain("听力练习");
    expect(source).toContain("针对练习");
  });

  it("parses date-only learning tasks without shifting the selected calendar day", async () => {
    const modulePath = "../features/learning/learning-schema";
    const { getLearningTaskCreateValues } = (await import(/* @vite-ignore */ modulePath)) as {
      getLearningTaskCreateValues: (formData: FormData) => {
        success: boolean;
        data?: { targetDate: Date };
      };
    };
    const formData = new FormData();

    formData.set("title", "Unit 3 单词打卡");
    formData.set("taskType", "MEMORIZATION");
    formData.set("targetDate", "2026-05-20");
    formData.set("classGroupId", "ckj4w0x4g0000qzrmn831i7rn");
    formData.set("studentId", "");
    formData.set("returnTo", "/dashboard/learning");

    const result = getLearningTaskCreateValues(formData);

    expect(result.success).toBe(true);
    expect(result.data?.targetDate.toISOString().slice(0, 10)).toBe("2026-05-20");
  });

  it("calculates completion rate and current streak from task history", async () => {
    const modulePath = "../features/learning/stats";
    const { calculateLearningCheckInStats } = (await import(/* @vite-ignore */ modulePath)) as {
      calculateLearningCheckInStats: (
        days: Array<{ date: string; total: number; completed: number }>,
        today: string,
      ) => { completionRate: number; currentStreak: number };
    };

    expect(
      calculateLearningCheckInStats(
        [
          { date: "2026-05-18", total: 2, completed: 2 },
          { date: "2026-05-19", total: 1, completed: 1 },
          { date: "2026-05-20", total: 2, completed: 1 },
        ],
        "2026-05-20",
      ),
    ).toEqual({ completionRate: 80, currentStreak: 0 });

    expect(
      calculateLearningCheckInStats(
        [
          { date: "2026-05-18", total: 1, completed: 1 },
          { date: "2026-05-19", total: 2, completed: 2 },
          { date: "2026-05-20", total: 1, completed: 1 },
        ],
        "2026-05-20",
      ),
    ).toEqual({ completionRate: 100, currentStreak: 3 });
  });

  it("records student learning check-ins with validation, scope checks, and audit logging", () => {
    const action = readFileSync(join(process.cwd(), "features/learning/actions.ts"), "utf8");
    const schema = readFileSync(
      join(process.cwd(), "features/learning/learning-schema.ts"),
      "utf8",
    );

    expect(schema).toContain("learningTaskCheckInSchema");
    expect(action).toContain("checkInLearningTaskAction");
    expect(action).toContain('requirePermission("route:student"');
    expect(action).toContain("getLearningTaskCheckInValues");
    expect(action).toContain("tx.learningTaskCheckIn.upsert");
    expect(action).toContain("student: {");
    expect(action).toContain("userId: currentUser.id");
    expect(action).toContain("learningTask.checkIn");
    expect(action).toContain("writeAuditLog");
  });

  it("lets staff assign daily learning tasks to a class or one student", () => {
    const action = readFileSync(join(process.cwd(), "features/learning/actions.ts"), "utf8");
    const query = readFileSync(join(process.cwd(), "features/learning/queries.ts"), "utf8");
    const dialogPath = join(process.cwd(), "features/learning/learning-task-create-dialog.tsx");
    const dashboardPagePath = join(process.cwd(), "app/(dashboard)/dashboard/learning/page.tsx");

    expect(existsSync(dialogPath)).toBe(true);
    expect(existsSync(dashboardPagePath)).toBe(true);
    expect(query).toContain("getLearningTaskAssignmentOptions");
    expect(query).toContain("getStaffLearningTaskList");
    expect(action).toContain("createLearningTaskAction");
    expect(action).toContain('requirePermission("homework:manage"');
    expect(action).toContain("tx.learningTask.create");
    expect(action).toContain("learningTask.create");
    expect(readFileSync(dashboardPagePath, "utf8")).toContain("LearningTaskCreateDialog");
  });

  it("queries and renders today's learning tasks on the student portal", () => {
    const query = readFileSync(join(process.cwd(), "features/learning/queries.ts"), "utf8");
    const cardPath = join(process.cwd(), "features/learning/learning-task-card.tsx");
    const studentPage = readFileSync(join(process.cwd(), "app/(mobile)/student/page.tsx"), "utf8");

    expect(existsSync(cardPath)).toBe(true);
    expect(query).toContain("getStudentLearningTasks");
    expect(query).toContain("getStudentLearningStats");
    expect(query).toContain("targetDate");
    expect(query).toContain("checkIns");
    expect(studentPage).toContain("getStudentLearningTasks");
    expect(studentPage).toContain("getStudentLearningStats");
    expect(studentPage).toContain("LearningTaskCard");
    expect(studentPage).toContain("今日学习任务");
    expect(studentPage).toContain("单词打卡");
    expect(studentPage).toContain("每日阅读");
    expect(studentPage).toContain("听力练习");
  });
});
