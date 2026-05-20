import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("mistake notebook", () => {
  it("queries student mistakes only through the current student user", () => {
    const queryPath = join(process.cwd(), "features/mistakes/queries.ts");

    expect(existsSync(queryPath)).toBe(true);
    if (!existsSync(queryPath)) {
      return;
    }

    const source = readFileSync(queryPath, "utf8");

    expect(source).toContain("getStudentErrorRecords");
    expect(source).toContain("prisma.errorRecord.findMany");
    expect(source).toContain("tenantId");
    expect(source).toContain("userId");
    expect(source).toContain("student: {");
    expect(source).toContain("knowledgePoint");
    expect(source).toContain("question");
  });

  it("queries parent mistakes only through bound student guardians", () => {
    const queryPath = join(process.cwd(), "features/mistakes/queries.ts");

    expect(existsSync(queryPath)).toBe(true);
    if (!existsSync(queryPath)) {
      return;
    }

    const source = readFileSync(queryPath, "utf8");

    expect(source).toContain("getParentErrorRecords");
    expect(source).toContain("parentUserId");
    expect(source).toContain("guardians");
    expect(source).toContain("guardian");
    expect(source).toContain("tenantId");
  });

  it("renders student and parent mistake notebook pages with route states", () => {
    const studentPagePath = join(process.cwd(), "app/(mobile)/student/mistakes/page.tsx");
    const parentPagePath = join(process.cwd(), "app/(mobile)/parent/mistakes/page.tsx");
    const cardPath = join(process.cwd(), "features/mistakes/error-record-card.tsx");

    for (const file of [studentPagePath, parentPagePath, cardPath]) {
      expect(existsSync(file)).toBe(true);
    }

    if (!existsSync(studentPagePath) || !existsSync(parentPagePath) || !existsSync(cardPath)) {
      return;
    }

    const studentPage = readFileSync(studentPagePath, "utf8");
    const parentPage = readFileSync(parentPagePath, "utf8");
    const card = readFileSync(cardPath, "utf8");

    expect(studentPage).toContain('requirePermission("mistakes:viewOwn"');
    expect(studentPage).toContain("getStudentErrorRecords");
    expect(parentPage).toContain('requirePermission("mistakes:viewOwn"');
    expect(parentPage).toContain("getParentErrorRecords");
    expect(studentPage).toContain("ErrorRecordCard");
    expect(parentPage).toContain("ErrorRecordCard");
    expect(card).toContain("errorRecordStatusLabels");

    for (const routeFile of [
      "app/(mobile)/student/mistakes/loading.tsx",
      "app/(mobile)/student/mistakes/error.tsx",
      "app/(mobile)/parent/mistakes/loading.tsx",
      "app/(mobile)/parent/mistakes/error.tsx",
    ]) {
      expect(existsSync(join(process.cwd(), routeFile))).toBe(true);
    }
  });

  it("protects mistake notebook routes in e2e coverage", () => {
    const e2eSource = readFileSync(join(process.cwd(), "tests/e2e/auth.spec.ts"), "utf8");

    expect(e2eSource).toContain("/student/mistakes");
    expect(e2eSource).toContain("/parent/mistakes");
  });
});
