import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { calculateCourseAccountBalance } from "../features/course-accounts/balance";
import { hasPermission } from "../lib/rbac/permissions";

describe("course account foundation", () => {
  it("calculates remaining hours safely unless negative balance is allowed", () => {
    expect(
      calculateCourseAccountBalance({
        purchasedHours: 40,
        giftHours: 4,
        usedHours: 10,
        frozenHours: 2,
      }),
    ).toEqual({
      totalHours: 44,
      remainingHours: 32,
      rawRemainingHours: 32,
      isNegative: false,
    });

    expect(
      calculateCourseAccountBalance({
        purchasedHours: 10,
        giftHours: 0,
        usedHours: 12,
        frozenHours: 0,
      }).remainingHours,
    ).toBe(0);
    expect(
      calculateCourseAccountBalance(
        {
          purchasedHours: 10,
          giftHours: 0,
          usedHours: 12,
          frozenHours: 0,
        },
        { allowNegativeBalance: true },
      ).remainingHours,
    ).toBe(-2);
  });

  it("keeps course account view permissions scoped by role", () => {
    expect(hasPermission("ORG_ADMIN", "courseConsumption:view")).toBe(true);
    expect(hasPermission("FINANCE", "courseConsumption:view")).toBe(true);
    expect(hasPermission("STUDENT", "courseConsumption:view")).toBe(true);
    expect(hasPermission("PARENT", "courseConsumption:view")).toBe(true);
  });

  it("reads staff, student, and parent course accounts with tenant and user scope", () => {
    const source = readFileSync(join(process.cwd(), "features/course-accounts/queries.ts"), "utf8");

    expect(source).toContain("getCourseAccountList");
    expect(source).toContain("tenantId");
    expect(source).toContain("prisma.courseAccount.count");
    expect(source).toContain("getStudentCourseAccounts");
    expect(source).toContain("student: {");
    expect(source).toContain("userId");
    expect(source).toContain("getParentCourseAccounts");
    expect(source).toContain("guardian: {");
  });

  it("renders staff and own-balance course account pages", () => {
    const staffPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/course-accounts/page.tsx"),
      "utf8",
    );
    const studentPage = readFileSync(join(process.cwd(), "app/(mobile)/student/page.tsx"), "utf8");
    const parentPage = readFileSync(join(process.cwd(), "app/(mobile)/parent/page.tsx"), "utf8");
    const loadingPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/course-accounts/loading.tsx"),
      "utf8",
    );
    const errorPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/course-accounts/error.tsx"),
      "utf8",
    );

    expect(staffPage).toContain('requirePermission("courseConsumption:view"');
    expect(staffPage).toContain("calculateCourseAccountBalance");
    expect(staffPage).toContain('name="q"');
    expect(studentPage).toContain("calculateCourseAccountBalance");
    expect(parentPage).toContain("getParentCourseAccounts");
    expect(parentPage).toContain("calculateCourseAccountBalance");
    expect(loadingPage).toContain("LoadingState");
    expect(errorPage).toContain("ErrorState");
  });
});
