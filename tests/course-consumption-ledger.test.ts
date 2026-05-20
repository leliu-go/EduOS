import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("course consumption ledger", () => {
  it("reads staff ledger with tenant scope, pagination, and student/course/class search", () => {
    const queryPath = join(process.cwd(), "features/course-consumptions/queries.ts");

    expect(existsSync(queryPath)).toBe(true);
    if (!existsSync(queryPath)) {
      return;
    }

    const source = readFileSync(queryPath, "utf8");

    expect(source).toContain("getCourseConsumptionLedger");
    expect(source).toContain("tenantId");
    expect(source).toContain("prisma.courseConsumption.count");
    expect(source).toContain("skip");
    expect(source).toContain("take");
    expect(source).toContain("student: { name:");
    expect(source).toContain("courseProduct: { name:");
    expect(source).toContain("classGroup: { name:");
  });

  it("scopes student and parent ledgers to the current user only", () => {
    const queryPath = join(process.cwd(), "features/course-consumptions/queries.ts");

    expect(existsSync(queryPath)).toBe(true);
    if (!existsSync(queryPath)) {
      return;
    }

    const source = readFileSync(queryPath, "utf8");

    expect(source).toContain("getStudentCourseConsumptionLedger");
    expect(source).toContain("student: {");
    expect(source).toContain("userId");
    expect(source).toContain("getParentCourseConsumptionLedger");
    expect(source).toContain("guardians: {");
    expect(source).toContain("guardian: {");
  });

  it("renders staff and portal ledger pages with clear balance display", () => {
    const staffPagePath = join(
      process.cwd(),
      "app/(dashboard)/dashboard/course-consumptions/page.tsx",
    );
    const studentPagePath = join(process.cwd(), "app/(mobile)/student/page.tsx");
    const parentPagePath = join(process.cwd(), "app/(mobile)/parent/consumption/page.tsx");

    expect(existsSync(staffPagePath)).toBe(true);
    expect(existsSync(parentPagePath)).toBe(true);
    if (!existsSync(staffPagePath) || !existsSync(parentPagePath)) {
      return;
    }

    const staffPage = readFileSync(staffPagePath, "utf8");
    const studentPage = readFileSync(studentPagePath, "utf8");
    const parentPage = readFileSync(parentPagePath, "utf8");
    const ledgerCard = readFileSync(
      join(process.cwd(), "features/course-consumptions/ledger-card.tsx"),
      "utf8",
    );

    expect(staffPage).toContain('requirePermission("courseConsumption:view"');
    expect(staffPage).toContain("getCourseConsumptionLedger");
    expect(staffPage).toContain('name="q"');
    expect(staffPage).toContain("DataTable");
    expect(staffPage).toContain("calculateCourseAccountBalance");
    expect(studentPage).toContain("getStudentCourseConsumptionLedger");
    expect(studentPage).toContain("CourseConsumptionLedgerCard");
    expect(parentPage).toContain('requirePermission("route:parent"');
    expect(parentPage).toContain("getParentCourseConsumptionLedger");
    expect(parentPage).toContain("CourseConsumptionLedgerCard");
    expect(ledgerCard).toContain("calculateCourseAccountBalance");
  });

  it("adds loading and error states for the staff ledger route", () => {
    const loadingPage = join(
      process.cwd(),
      "app/(dashboard)/dashboard/course-consumptions/loading.tsx",
    );
    const errorPage = join(
      process.cwd(),
      "app/(dashboard)/dashboard/course-consumptions/error.tsx",
    );

    expect(existsSync(loadingPage)).toBe(true);
    expect(existsSync(errorPage)).toBe(true);
    if (!existsSync(loadingPage) || !existsSync(errorPage)) {
      return;
    }

    expect(readFileSync(loadingPage, "utf8")).toContain("LoadingState");
    expect(readFileSync(errorPage, "utf8")).toContain("ErrorState");
  });
});
