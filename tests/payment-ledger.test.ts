import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { hasPermission } from "../lib/rbac/permissions";

describe("payment ledger", () => {
  it("defines tenant-scoped payment records linked to orders", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("enum PaymentStatus");
    expect(schema).toContain("enum PaymentMethod");
    for (const status of ["PENDING", "CONFIRMED", "FAILED", "CANCELLED"]) {
      expect(schema).toContain(status);
    }

    expect(schema).toContain("model Payment");
    expect(schema).toMatch(/orderId\s+String/);
    expect(schema).toMatch(/studentId\s+String/);
    expect(schema).toMatch(/guardianId\s+String\?/);
    expect(schema).toMatch(/amount\s+Decimal/);
    expect(schema).toMatch(/currency\s+String\s+@default\("CNY"\)/);
    expect(schema).toMatch(/status\s+PaymentStatus\s+@default\(PENDING\)/);
    expect(schema).toContain("payments   Payment[]");
    expect(schema).toContain("@@index([tenantId, orderId])");
    expect(schema).toContain("@@index([tenantId, studentId])");
    expect(schema).toContain("@@index([tenantId, status])");
  });

  it("keeps finance and own-payment visibility separate", () => {
    expect(hasPermission("FINANCE", "finance:reports:view")).toBe(true);
    expect(hasPermission("STUDENT", "payments:viewOwn")).toBe(true);
    expect(hasPermission("PARENT", "payments:viewOwn")).toBe(true);
    expect(hasPermission("TEACHER", "payments:viewOwn")).toBe(false);
  });

  it("queries payment records with staff, student, and parent scope", () => {
    const queryPath = join(process.cwd(), "features/payments/queries.ts");

    expect(existsSync(queryPath)).toBe(true);
    if (!existsSync(queryPath)) {
      return;
    }

    const source = readFileSync(queryPath, "utf8");

    expect(source).toContain("getStaffPaymentList");
    expect(source).toContain("getStudentPaymentList");
    expect(source).toContain("getParentPaymentList");
    expect(source).toContain("prisma.payment.findMany");
    expect(source).toContain("tenantId");
    expect(source).toContain("userId");
    expect(source).toContain("guardians");
    expect(source).toContain("parentUserId");
  });

  it("renders finance and own-payment pages", () => {
    const staffPage = join(process.cwd(), "app/(dashboard)/dashboard/payments/page.tsx");
    const studentPage = join(process.cwd(), "app/(mobile)/student/payments/page.tsx");
    const parentPage = join(process.cwd(), "app/(mobile)/parent/payments/page.tsx");
    const sidebarPath = join(process.cwd(), "components/layout/app-sidebar.tsx");
    const e2ePath = join(process.cwd(), "tests/e2e/auth.spec.ts");

    for (const file of [staffPage, studentPage, parentPage]) {
      expect(existsSync(file)).toBe(true);
    }

    if (!existsSync(staffPage) || !existsSync(studentPage) || !existsSync(parentPage)) {
      return;
    }

    const staffSource = readFileSync(staffPage, "utf8");
    const studentSource = readFileSync(studentPage, "utf8");
    const parentSource = readFileSync(parentPage, "utf8");
    const sidebarSource = readFileSync(sidebarPath, "utf8");
    const e2eSource = readFileSync(e2ePath, "utf8");

    expect(staffSource).toContain('requirePermission("finance:reports:view"');
    expect(studentSource).toContain('requirePermission("payments:viewOwn"');
    expect(parentSource).toContain('requirePermission("payments:viewOwn"');
    expect(staffSource).toContain("getStaffPaymentList");
    expect(studentSource).toContain("getStudentPaymentList");
    expect(parentSource).toContain("getParentPaymentList");
    expect(staffSource + studentSource + parentSource).toContain("PaymentList");
    expect(sidebarSource).toContain("/dashboard/payments");

    for (const route of ["/dashboard/payments", "/student/payments", "/parent/payments"]) {
      expect(e2eSource).toContain(route);
    }

    for (const routeFile of [
      "app/(dashboard)/dashboard/payments/loading.tsx",
      "app/(dashboard)/dashboard/payments/error.tsx",
      "app/(mobile)/student/payments/loading.tsx",
      "app/(mobile)/student/payments/error.tsx",
      "app/(mobile)/parent/payments/loading.tsx",
      "app/(mobile)/parent/payments/error.tsx",
    ]) {
      expect(existsSync(join(process.cwd(), routeFile))).toBe(true);
    }
  });
});
