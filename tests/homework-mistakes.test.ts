import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("homework mistake marking", () => {
  it("validates optional mistake fields on homework correction", async () => {
    const modulePath = "../features/homework/homework-schema";
    const { homeworkCorrectionSchema } = (await import(/* @vite-ignore */ modulePath)) as {
      homeworkCorrectionSchema: {
        safeParse: (input: unknown) =>
          | {
              success: true;
              data: { mistakeKnowledgePointId?: string; mistakeErrorReason?: string };
            }
          | { success: false };
      };
    };

    const parsed = homeworkCorrectionSchema.safeParse({
      submissionId: "cm00000000000000000000001",
      status: "NEEDS_REVISION",
      comment: "Revise the calculation process.",
      mistakeKnowledgePointId: "cm00000000000000000000002",
      mistakeErrorReason: "CARELESS",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.mistakeKnowledgePointId).toBe("cm00000000000000000000002");
      expect(parsed.data.mistakeErrorReason).toBe("CARELESS");
    }

    expect(
      homeworkCorrectionSchema.safeParse({
        submissionId: "cm00000000000000000000001",
        status: "CORRECTED",
        comment: "Good correction.",
        mistakeKnowledgePointId: "bad-id",
        mistakeErrorReason: "CARELESS",
      }).success,
    ).toBe(false);
  });

  it("creates tenant-scoped error records from authorized homework correction", () => {
    const source = readFileSync(join(process.cwd(), "features/homework/actions.ts"), "utf8");

    expect(source).toContain("canCorrectHomeworkSubmission");
    expect(source).toContain('requirePermission("homework:correct"');
    expect(source).toContain("mistakeKnowledgePointId");
    expect(source).toContain("tx.knowledgePoint.findFirst");
    expect(source).toContain("tx.errorRecord.create");
    expect(source).toContain('sourceType: "HOMEWORK_SUBMISSION"');
    expect(source).toContain("studentId: submission.studentId");
    expect(source).toContain("homeworkSubmissionId: submission.id");
    expect(source).toContain("knowledgePointId: parsed.data.mistakeKnowledgePointId");
    expect(source).toContain("errorReason: parsed.data.mistakeErrorReason");
    expect(source).toContain("errorRecord.createFromHomework");
  });

  it("renders teacher mistake controls with knowledge point options", () => {
    const queries = readFileSync(join(process.cwd(), "features/homework/queries.ts"), "utf8");
    const dialog = readFileSync(
      join(process.cwd(), "features/homework/homework-correction-dialog.tsx"),
      "utf8",
    );
    const teacherPage = readFileSync(
      join(process.cwd(), "app/(mobile)/teacher/homework/page.tsx"),
      "utf8",
    );

    expect(queries).toContain("getHomeworkCorrectionOptions");
    expect(queries).toContain("prisma.knowledgePoint.findMany");
    expect(dialog).toContain("knowledgePoints");
    expect(dialog).toContain('name="mistakeKnowledgePointId"');
    expect(dialog).toContain('name="mistakeErrorReason"');
    expect(dialog).toContain("errorReasonLabels");
    expect(teacherPage).toContain("getHomeworkCorrectionOptions");
    expect(teacherPage).toContain("knowledgePoints={correctionOptions.knowledgePoints}");
  });
});
