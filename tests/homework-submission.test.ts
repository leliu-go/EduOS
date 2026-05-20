import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("homework submission", () => {
  it("validates student submission text, image, or file metadata", async () => {
    const modulePath = "../features/homework/homework-schema";
    const { homeworkSubmissionSchema } = (await import(/* @vite-ignore */ modulePath)) as {
      homeworkSubmissionSchema: {
        safeParse: (input: unknown) => { success: boolean };
      };
    };

    expect(
      homeworkSubmissionSchema.safeParse({
        homeworkId: "cm00000000000000000000001",
      }).success,
    ).toBe(false);
    expect(
      homeworkSubmissionSchema.safeParse({
        homeworkId: "cm00000000000000000000001",
        contentText: "已完成第 1-3 页。",
      }).success,
    ).toBe(true);
    expect(
      homeworkSubmissionSchema.safeParse({
        homeworkId: "cm00000000000000000000001",
        fileName: "homework.pdf",
        fileUrl: "https://example.com/homework.pdf",
      }).success,
    ).toBe(true);
  });

  it("submits only homework visible to the current student and preserves attempts", () => {
    const source = readFileSync(join(process.cwd(), "features/homework/actions.ts"), "utf8");

    expect(source).toContain("submitHomeworkAction");
    expect(source).toContain("getHomeworkSubmissionValues");
    expect(source).toContain('requirePermission("homework:submit"');
    expect(source).toContain("studentProfile.findFirst");
    expect(source).toContain("student: {");
    expect(source).toContain("classGroup: {");
    expect(source).toContain("lesson: {");
    expect(source).toContain("homeworkSubmission.findFirst");
    expect(source).toContain("canSubmitHomeworkAttempt");
    expect(source).toContain("attemptNumber");
    expect(source).toContain("tx.homeworkSubmission.create");
    expect(source).toContain('status: "PENDING_CORRECTION"');
    expect(source).toContain("homework.submit");
  });

  it("queries student homework with latest own submission", () => {
    const source = readFileSync(join(process.cwd(), "features/homework/queries.ts"), "utf8");

    expect(source).toContain("getStudentHomeworkList");
    expect(source).toContain("student: {");
    expect(source).toContain("userId");
    expect(source).toContain("submissions");
    expect(source).toContain('orderBy: [{ attemptNumber: "desc" }]');
  });

  it("renders student homework page with submission form and states", () => {
    const pagePath = join(process.cwd(), "app/(mobile)/student/homework/page.tsx");
    const formPath = join(process.cwd(), "features/homework/homework-submission-form.tsx");
    const loadingPath = join(process.cwd(), "app/(mobile)/student/homework/loading.tsx");
    const errorPath = join(process.cwd(), "app/(mobile)/student/homework/error.tsx");

    for (const file of [pagePath, formPath, loadingPath, errorPath]) {
      expect(existsSync(file)).toBe(true);
    }

    if (!existsSync(pagePath) || !existsSync(formPath)) {
      return;
    }

    const page = readFileSync(pagePath, "utf8");
    const form = readFileSync(formPath, "utf8");

    expect(page).toContain('requirePermission("homework:submit"');
    expect(page).toContain("getStudentHomeworkList");
    expect(page).toContain("HomeworkSubmissionForm");
    expect(form).toContain("submitHomeworkAction");
    expect(form).toContain('name="contentText"');
    expect(form).toContain('name="fileUrl"');
    expect(form).toContain('name="imageUrl"');
    expect(readFileSync(loadingPath, "utf8")).toContain("LoadingState");
    expect(readFileSync(errorPath, "utf8")).toContain("ErrorState");
  });

  it("protects the student homework route", () => {
    const e2eSource = readFileSync(join(process.cwd(), "tests/e2e/auth.spec.ts"), "utf8");

    expect(e2eSource).toContain("/student/homework");
  });
});
