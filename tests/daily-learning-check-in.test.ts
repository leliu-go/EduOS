import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("daily learning check-in", () => {
  it("adds tenant-scoped daily learning task and check-in models", () => {
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
    expect(studentPage).toContain("今日学习打卡");
  });
});
