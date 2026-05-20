import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("parent portal home", () => {
  it("queries parent attendance and contracts only through bound students", () => {
    const attendanceSource = readFileSync(
      join(process.cwd(), "features/attendance/queries.ts"),
      "utf8",
    );
    const contractPath = join(process.cwd(), "features/contracts/queries.ts");

    expect(attendanceSource).toContain("getParentAttendanceRecords");
    expect(attendanceSource).toContain("prisma.attendance.findMany");
    expect(attendanceSource).toContain("guardians");
    expect(attendanceSource).toContain("guardian");
    expect(attendanceSource).toContain("userId");
    expect(attendanceSource).toContain("tenantId");

    expect(existsSync(contractPath)).toBe(true);
    if (!existsSync(contractPath)) {
      return;
    }

    const contractSource = readFileSync(contractPath, "utf8");

    expect(contractSource).toContain("getParentContractList");
    expect(contractSource).toContain("prisma.contract.findMany");
    expect(contractSource).toContain("student: {");
    expect(contractSource).toContain("guardians");
    expect(contractSource).toContain("guardian");
    expect(contractSource).toContain("parentUserId");
    expect(contractSource).toContain("tenantId");
  });

  it("renders mobile-first cards for the required parent home areas", () => {
    const page = readFileSync(join(process.cwd(), "app/(mobile)/parent/page.tsx"), "utf8");

    expect(page).toContain('requirePermission("route:parent"');
    expect(page).toContain("getParentTimetable");
    expect(page).toContain("getParentAttendanceRecords");
    expect(page).toContain("getParentCourseAccounts");
    expect(page).toContain("getParentHomeworkReminders");
    expect(page).toContain("getParentLearningReports");
    expect(page).toContain("getParentPaymentList");
    expect(page).toContain("getParentContractList");
    expect(page).toContain("calculateCourseAccountBalance");
    expect(page).toContain("grid-cols-2");
    expect(page).toContain("孩子今日课程");
    expect(page).toContain("考勤记录");
    expect(page).toContain("剩余课时");
    expect(page).toContain("作业状态");
    expect(page).toContain("学情报告");
    expect(page).toContain("缴费合同");
    expect(page).toContain("/parent/consumption");
    expect(page).toContain("/parent/reports");
    expect(page).toContain("/parent/payments");
  });

  it("keeps parent home loading and error states", () => {
    for (const routeFile of ["app/(mobile)/parent/loading.tsx", "app/(mobile)/parent/error.tsx"]) {
      expect(existsSync(join(process.cwd(), routeFile))).toBe(true);
    }
  });

  it("provides a protected parent profile page for the bottom navigation", () => {
    const navSource = readFileSync(
      join(process.cwd(), "components/layout/mobile-bottom-nav.tsx"),
      "utf8",
    );
    const pagePath = join(process.cwd(), "app/(mobile)/parent/me/page.tsx");

    expect(navSource).toContain('href: "/parent/me"');
    expect(existsSync(pagePath)).toBe(true);
    expect(existsSync(join(process.cwd(), "app/(mobile)/parent/me/loading.tsx"))).toBe(true);
    expect(existsSync(join(process.cwd(), "app/(mobile)/parent/me/error.tsx"))).toBe(true);

    const page = readFileSync(pagePath, "utf8");

    expect(page).toContain('requirePermission("route:parent"');
    expect(page).toContain("getStudentsForParentUser(currentUser.tenantId, currentUser.id)");
    expect(page).toContain("currentUser.tenantName");
  });
});
