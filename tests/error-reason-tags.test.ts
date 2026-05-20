import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { errorReasonLabels } from "@/features/mistakes/error-record-schema";

describe("error reason tags", () => {
  it("uses the required reason tag labels", () => {
    expect(errorReasonLabels).toMatchObject({
      CONCEPT_UNCLEAR: "概念不清",
      CALCULATION_ERROR: "计算错误",
      READING_ERROR: "审题错误",
      METHOD_ERROR: "方法错误",
      CARELESS: "粗心",
    });
  });

  it("builds zero-filled statistics for every reason tag", async () => {
    const statsPath = join(process.cwd(), "features/mistakes/error-reason-stats.ts");

    expect(existsSync(statsPath)).toBe(true);
    if (!existsSync(statsPath)) {
      return;
    }

    const modulePath = "../features/mistakes/error-reason-stats";
    const { buildErrorReasonStats } = (await import(/* @vite-ignore */ modulePath)) as {
      buildErrorReasonStats: (
        rows: Array<{ errorReason: string; _count: { _all: number } }>,
      ) => Array<{ reason: string; label: string; count: number }>;
    };

    expect(
      buildErrorReasonStats([
        { errorReason: "CARELESS", _count: { _all: 2 } },
        { errorReason: "METHOD_ERROR", _count: { _all: 1 } },
      ]),
    ).toEqual([
      { reason: "CONCEPT_UNCLEAR", label: "概念不清", count: 0 },
      { reason: "CALCULATION_ERROR", label: "计算错误", count: 0 },
      { reason: "READING_ERROR", label: "审题错误", count: 0 },
      { reason: "METHOD_ERROR", label: "方法错误", count: 1 },
      { reason: "CARELESS", label: "粗心", count: 2 },
      { reason: "OTHER", label: "其他", count: 0 },
    ]);
  });

  it("queries tenant-scoped reason statistics for students and parents", () => {
    const queryPath = join(process.cwd(), "features/mistakes/queries.ts");
    const source = readFileSync(queryPath, "utf8");

    expect(source).toContain("getStudentErrorReasonStats");
    expect(source).toContain("getParentErrorReasonStats");
    expect(source).toContain("prisma.errorRecord.groupBy");
    expect(source).toContain('by: ["errorReason"]');
    expect(source).toContain("buildErrorReasonStats");
    expect(source).toContain("student: {");
    expect(source).toContain("userId");
    expect(source).toContain("guardians");
    expect(source).toContain("parentUserId");
  });

  it("renders reason statistics on student and parent mistake pages", () => {
    const studentPage = readFileSync(
      join(process.cwd(), "app/(mobile)/student/mistakes/page.tsx"),
      "utf8",
    );
    const parentPage = readFileSync(
      join(process.cwd(), "app/(mobile)/parent/mistakes/page.tsx"),
      "utf8",
    );

    expect(studentPage).toContain("ErrorReasonStats");
    expect(studentPage).toContain("getStudentErrorReasonStats");
    expect(parentPage).toContain("ErrorReasonStats");
    expect(parentPage).toContain("getParentErrorReasonStats");
    expect(studentPage + parentPage).toContain("错因统计");
  });
});
