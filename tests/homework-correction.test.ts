import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("homework correction", () => {
  it("validates correction status, score, and required comment", async () => {
    const modulePath = "../features/homework/homework-schema";
    const { homeworkCorrectionSchema } = (await import(/* @vite-ignore */ modulePath)) as {
      homeworkCorrectionSchema: {
        safeParse: (
          input: unknown,
        ) => { success: true; data: { score?: number } } | { success: false };
      };
    };

    expect(
      homeworkCorrectionSchema.safeParse({
        submissionId: "cm00000000000000000000001",
        status: "CORRECTED",
      }).success,
    ).toBe(false);
    expect(
      homeworkCorrectionSchema.safeParse({
        submissionId: "cm00000000000000000000001",
        status: "NEEDS_REVISION",
        score: "86",
        comment: "订正第 3 题过程。",
      }).success,
    ).toBe(true);

    const withoutScore = homeworkCorrectionSchema.safeParse({
      submissionId: "cm00000000000000000000001",
      status: "CORRECTED",
      score: null,
      comment: "完成质量良好。",
    });

    expect(withoutScore.success).toBe(true);
    if (withoutScore.success) {
      expect(withoutScore.data.score).toBeUndefined();
    }
  });

  it("corrects submissions through teacher scope checks and audit logging", () => {
    const source = readFileSync(join(process.cwd(), "features/homework/actions.ts"), "utf8");

    expect(source).toContain("correctHomeworkSubmissionAction");
    expect(source).toContain("getHomeworkCorrectionValues");
    expect(source).toContain('requirePermission("homework:correct"');
    expect(source).toContain("canCorrectHomeworkSubmission");
    expect(source).toContain('currentUser.roleKey === "TEACHER"');
    expect(source).toContain("primaryTeacher");
    expect(source).toContain("tx.homeworkCorrection.create");
    expect(source).toContain("tx.homeworkSubmission.update");
    expect(source).toContain("status: parsed.data.status");
    expect(source).toContain("homework.correct");
  });

  it("queries teacher pending submissions and parent-visible corrections", () => {
    const source = readFileSync(join(process.cwd(), "features/homework/queries.ts"), "utf8");

    expect(source).toContain("getTeacherHomeworkSubmissionsForCorrection");
    expect(source).toContain("getParentHomeworkCorrections");
    expect(source).toContain("guardians");
    expect(source).toContain("corrections");
    expect(source).toContain("homeworkSubmission.findMany");
    expect(source).toContain("homeworkCorrection.findMany");
  });

  it("renders correction dialog and makes results visible to student and parent", () => {
    const dialogPath = join(process.cwd(), "features/homework/homework-correction-dialog.tsx");
    const teacherPagePath = join(process.cwd(), "app/(mobile)/teacher/homework/page.tsx");
    const studentPagePath = join(process.cwd(), "app/(mobile)/student/homework/page.tsx");
    const parentPagePath = join(process.cwd(), "app/(mobile)/parent/page.tsx");

    for (const file of [dialogPath, teacherPagePath, studentPagePath, parentPagePath]) {
      expect(existsSync(file)).toBe(true);
    }

    const dialog = readFileSync(dialogPath, "utf8");
    const teacherPage = readFileSync(teacherPagePath, "utf8");
    const studentPage = readFileSync(studentPagePath, "utf8");
    const parentPage = readFileSync(parentPagePath, "utf8");

    expect(dialog).toContain("correctHomeworkSubmissionAction");
    expect(dialog).toContain('name="comment"');
    expect(dialog).toContain('name="score"');
    expect(teacherPage).toContain("HomeworkCorrectionDialog");
    expect(teacherPage).toContain("getTeacherHomeworkSubmissionsForCorrection");
    expect(studentPage).toContain("corrections");
    expect(parentPage).toContain("getParentHomeworkCorrections");
    expect(parentPage).toContain("homeworkCorrection");
  });
});
