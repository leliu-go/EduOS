import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("homework revision flow", () => {
  it("keeps historical submissions when a student submits a revision", () => {
    const source = readFileSync(join(process.cwd(), "features/homework/actions.ts"), "utf8");

    expect(source).toContain("latestSubmission");
    expect(source).toContain('latestSubmission.status === "NEEDS_REVISION"');
    expect(source).toContain("canSubmitHomeworkAttempt");
    expect(source).toContain("latestSubmission.attemptNumber + 1");
    expect(source).toContain("homework.revise");
    expect(source).toContain("invalid_revision_state");
    expect(source).toContain("tx.homeworkSubmission.create");
  });

  it("loads submission history with correction results for the student homework page", () => {
    const source = readFileSync(join(process.cwd(), "features/homework/queries.ts"), "utf8");

    expect(source).toContain("submissions");
    expect(source).toContain('orderBy: [{ attemptNumber: "desc" }]');
    expect(source).toContain("take: 5");
    expect(source).toContain("corrections");
  });

  it("renders revision UI and teacher completed marking copy", () => {
    const submissionForm = readFileSync(
      join(process.cwd(), "features/homework/homework-submission-form.tsx"),
      "utf8",
    );
    const studentPage = readFileSync(
      join(process.cwd(), "app/(mobile)/student/homework/page.tsx"),
      "utf8",
    );
    const correctionDialog = readFileSync(
      join(process.cwd(), "features/homework/homework-correction-dialog.tsx"),
      "utf8",
    );

    expect(submissionForm).toContain("mode");
    expect(submissionForm).toContain("提交订正");
    expect(studentPage).toContain("canSubmitRevision");
    expect(studentPage).toContain("提交记录");
    expect(studentPage).toContain("submission.corrections[0]");
    expect(studentPage).toContain('mode={latestSubmission ? "revise" : "submit"}');
    expect(correctionDialog).toContain("标记完成");
  });
});
