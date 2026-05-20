import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("weakness statistics", () => {
  it("builds knowledge point weakness stats in count order", async () => {
    const statsPath = join(process.cwd(), "features/mistakes/weakness-stats.ts");

    expect(existsSync(statsPath)).toBe(true);
    if (!existsSync(statsPath)) {
      return;
    }

    const modulePath = "../features/mistakes/weakness-stats";
    const statsModule = (await import(/* @vite-ignore */ modulePath)) as {
      buildKnowledgePointWeaknessStats?: (
        rows: Array<{ knowledgePointId: string; _count: { _all: number } }>,
        knowledgePoints: Array<{
          id: string;
          name: string;
          chapter: string;
          subject: { name: string };
          grade: { name: string };
          parent: { name: string } | null;
        }>,
      ) => Array<{ knowledgePointId: string; label: string; count: number }>;
    };

    expect(statsModule.buildKnowledgePointWeaknessStats).toBeTypeOf("function");
    if (!statsModule.buildKnowledgePointWeaknessStats) {
      return;
    }

    expect(
      statsModule.buildKnowledgePointWeaknessStats(
        [
          { knowledgePointId: "kp-2", _count: { _all: 3 } },
          { knowledgePointId: "kp-1", _count: { _all: 1 } },
        ],
        [
          {
            id: "kp-1",
            name: "一元一次方程",
            chapter: "方程",
            subject: { name: "数学" },
            grade: { name: "七年级" },
            parent: null,
          },
          {
            id: "kp-2",
            name: "移项",
            chapter: "方程",
            subject: { name: "数学" },
            grade: { name: "七年级" },
            parent: { name: "一元一次方程" },
          },
        ],
      ),
    ).toEqual([
      {
        knowledgePointId: "kp-2",
        label: "数学 · 七年级 · 方程 · 一元一次方程 · 移项",
        count: 3,
      },
      {
        knowledgePointId: "kp-1",
        label: "数学 · 七年级 · 方程 · 一元一次方程",
        count: 1,
      },
    ]);
  });

  it("queries personal and teacher class weakness stats by knowledge point", () => {
    const source = readFileSync(join(process.cwd(), "features/mistakes/queries.ts"), "utf8");

    expect(source).toContain("getStudentKnowledgePointWeaknessStats");
    expect(source).toContain("getTeacherClassWeaknessStats");
    expect(source).toContain("prisma.errorRecord.groupBy");
    expect(source).toContain('by: ["knowledgePointId"]');
    expect(source).toContain("buildKnowledgePointWeaknessStats");
    expect(source).toContain("knowledgePoint.findMany");
    expect(source).toContain("student: {");
    expect(source).toContain("userId");
    expect(source).toContain("getTeacherErrorRecordScope");
  });

  it("renders weakness stats for students and teachers with route states", () => {
    const studentPage = readFileSync(
      join(process.cwd(), "app/(mobile)/student/mistakes/page.tsx"),
      "utf8",
    );
    const teacherPage = readFileSync(
      join(process.cwd(), "app/(mobile)/teacher/classes/page.tsx"),
      "utf8",
    );
    const componentPath = join(process.cwd(), "features/mistakes/weakness-stats-card.tsx");

    expect(existsSync(componentPath)).toBe(true);
    if (!existsSync(componentPath)) {
      return;
    }

    const componentSource = readFileSync(componentPath, "utf8");

    expect(studentPage).toContain("KnowledgePointWeaknessStats");
    expect(studentPage).toContain("getStudentKnowledgePointWeaknessStats");
    expect(studentPage).toContain("薄弱知识点");
    expect(teacherPage).toContain("KnowledgePointWeaknessStats");
    expect(teacherPage).toContain("getTeacherClassWeaknessStats");
    expect(teacherPage).toContain("班级高频薄弱点");
    expect(componentSource).toContain("暂无薄弱点");

    for (const routeFile of [
      "app/(mobile)/teacher/classes/loading.tsx",
      "app/(mobile)/teacher/classes/error.tsx",
    ]) {
      expect(existsSync(join(process.cwd(), routeFile))).toBe(true);
    }
  });
});
