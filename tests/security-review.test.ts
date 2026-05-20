import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { hasPermission } from "@/lib/rbac/permissions";

function readSource(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

function functionBody(source: string, functionName: string) {
  const start = source.indexOf(`export async function ${functionName}`);
  expect(start).toBeGreaterThanOrEqual(0);

  const nextExport = source.indexOf("\nexport async function ", start + 1);

  return source.slice(start, nextExport === -1 ? undefined : nextExport);
}

function expectTenantScopedGuardianBinding(source: string) {
  expect(source).toContain("guardians:");
  expect(source).toContain("guardian:");
  expect(source).toMatch(/guardian:\s*{\s*tenantId,\s*userId/);
}

describe("security review", () => {
  it("keeps mobile roles out of dashboard, finance, and staff-only permissions", () => {
    expect(hasPermission("STUDENT", "route:student")).toBe(true);
    expect(hasPermission("STUDENT", "route:dashboard")).toBe(false);
    expect(hasPermission("STUDENT", "finance:mutate")).toBe(false);
    expect(hasPermission("STUDENT", "teachers:manage")).toBe(false);

    expect(hasPermission("PARENT", "route:parent")).toBe(true);
    expect(hasPermission("PARENT", "route:dashboard")).toBe(false);
    expect(hasPermission("PARENT", "finance:mutate")).toBe(false);
    expect(hasPermission("PARENT", "students:manage")).toBe(false);

    expect(hasPermission("TEACHER", "route:teacher")).toBe(true);
    expect(hasPermission("TEACHER", "finance:mutate")).toBe(false);
    expect(hasPermission("TEACHER", "students:manage")).toBe(false);
    expect(hasPermission("TEACHER", "classes:manage")).toBe(false);
  });

  it("protects dashboard and mobile entry points with server-side route permissions", () => {
    expect(readSource("app/(dashboard)/layout.tsx")).toContain(
      'requirePermission("route:dashboard"',
    );
    expect(readSource("app/(mobile)/student/layout.tsx")).toContain(
      'requirePermission("route:student"',
    );
    expect(readSource("app/(mobile)/teacher/layout.tsx")).toContain(
      'requirePermission("route:teacher"',
    );
    expect(readSource("app/(mobile)/parent/layout.tsx")).toContain(
      'requirePermission("route:parent"',
    );
  });

  it("requires server authorization in every feature action module", () => {
    const actionFiles = [
      "features/academic-config/actions.ts",
      "features/accounts/actions.ts",
      "features/attendance/actions.ts",
      "features/campuses/actions.ts",
      "features/classes/actions.ts",
      "features/course-consumptions/actions.ts",
      "features/courses/actions.ts",
      "features/enrollments/actions.ts",
      "features/guardians/actions.ts",
      "features/homework/actions.ts",
      "features/learning/actions.ts",
      "features/lesson-feedback/actions.ts",
      "features/mistakes/actions.ts",
      "features/refunds/actions.ts",
      "features/resources/actions.ts",
      "features/scheduling/actions.ts",
      "features/students/actions.ts",
      "features/teachers/actions.ts",
    ];

    for (const actionFile of actionFiles) {
      expect(readSource(actionFile), actionFile).toContain("requirePermission(");
    }
  });

  it("binds parent-visible finance and learning ledgers to tenant-scoped guardians", () => {
    const attendanceQueries = readSource("features/attendance/queries.ts");
    const paymentQueries = readSource("features/payments/queries.ts");
    const courseAccountQueries = readSource("features/course-accounts/queries.ts");
    const courseConsumptionQueries = readSource("features/course-consumptions/queries.ts");
    const contractQueries = readSource("features/contracts/queries.ts");
    const homeworkQueries = readSource("features/homework/queries.ts");
    const mistakeQueries = readSource("features/mistakes/queries.ts");
    const lessonFeedbackQueries = readSource("features/lesson-feedback/queries.ts");

    for (const parentQuery of [
      functionBody(attendanceQueries, "getParentAttendanceRecords"),
      functionBody(paymentQueries, "getParentPaymentList"),
      functionBody(courseAccountQueries, "getParentCourseAccounts"),
      functionBody(courseConsumptionQueries, "getParentCourseConsumptionLedger"),
      functionBody(contractQueries, "getParentContractList"),
      functionBody(homeworkQueries, "getParentHomeworkReminders"),
      functionBody(homeworkQueries, "getParentHomeworkCorrections"),
      functionBody(mistakeQueries, "getParentErrorRecords"),
      functionBody(mistakeQueries, "getParentErrorReasonStats"),
      functionBody(lessonFeedbackQueries, "getParentLessonFeedback"),
    ]) {
      expect(parentQuery).toContain("tenantId,");
      expectTenantScopedGuardianBinding(parentQuery);
    }
  });

  it("keeps teacher and student mutations scoped to owned records", () => {
    const attendanceActions = readSource("features/attendance/actions.ts");
    const homeworkActions = readSource("features/homework/actions.ts");
    const mistakesActions = readSource("features/mistakes/actions.ts");
    const resourcesActions = readSource("features/resources/actions.ts");
    const feedbackActions = readSource("features/lesson-feedback/actions.ts");

    expect(attendanceActions).toContain('requirePermission("route:student"');
    expect(attendanceActions).toContain("payload.tenantId !== currentUser.tenantId");
    expect(attendanceActions).toContain('currentUser.roleKey === "TEACHER"');
    expect(attendanceActions).toContain("userId: currentUser.id");

    expect(homeworkActions).toContain('requirePermission("homework:submit"');
    expect(homeworkActions).toContain('currentUser.roleKey === "TEACHER"');
    expect(homeworkActions).toContain("userId: currentUser.id");

    expect(mistakesActions).toContain('requirePermission("mistakes:viewOwn"');
    expect(mistakesActions).toContain("getTeacherErrorRecordScope(currentUser.tenantId");

    expect(resourcesActions).toContain('currentUser.roleKey === "TEACHER"');
    expect(resourcesActions).toContain("userId: currentUser.id");

    expect(feedbackActions).toContain('currentUser.roleKey === "TEACHER"');
    expect(feedbackActions).toContain("userId: currentUser.id");
  });

  it("keeps finance and course consumption mutations transactional, audited, and tenant-scoped", () => {
    const refundActions = readSource("features/refunds/actions.ts");
    const courseConsumptionActions = readSource("features/course-consumptions/actions.ts");
    const financeReportPage = readSource("app/(dashboard)/dashboard/finance-reports/page.tsx");
    const financeReportExport = readSource(
      "app/(dashboard)/dashboard/finance-reports/export/route.ts",
    );

    expect(refundActions).toContain('requirePermission("finance:mutate"');
    expect(refundActions).toContain("validateRefundScope(tx, currentUser.tenantId");
    expect(refundActions).toContain("prisma.$transaction");
    expect(refundActions).toContain("writeAuditLog");
    expect(refundActions).toContain("tenantId: currentUser.tenantId");

    expect(courseConsumptionActions).toContain('requirePermission("courseConsumption:mutate"');
    expect(courseConsumptionActions).toContain("prisma.$transaction");
    expect(courseConsumptionActions).toContain("writeAuditLog");
    expect(courseConsumptionActions).toContain("tenantId: currentUser.tenantId");

    expect(financeReportPage).toContain('requirePermission("finance:reports:view"');
    expect(financeReportExport).toContain('requirePermission("finance:reports:view"');
  });
});
