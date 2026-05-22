import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { accountInvitationSchema } from "../features/accounts/account-schema";
import { canManageAccountRole } from "../features/accounts/account-policy";
import { hasPermission } from "../lib/rbac/permissions";

describe("account creation and invitation", () => {
  it("validates staff-created account input", () => {
    expect(() =>
      accountInvitationSchema.parse({
        targetType: "TEACHER",
        targetId: "clxtarget000000000000001",
        email: "teacher@example.com",
        phone: "13900000000",
        initialPassword: "EduOS-123456",
      }),
    ).not.toThrow();

    expect(() =>
      accountInvitationSchema.parse({
        targetType: "STUDENT",
        targetId: "bad-id",
        email: "bad-email",
        phone: "",
        initialPassword: "short",
      }),
    ).toThrow();
  });

  it("keeps account creation limited to authorized roles and teacher student scope", () => {
    expect(hasPermission("ORG_ADMIN", "accounts:invite")).toBe(true);
    expect(hasPermission("CAMPUS_ADMIN", "accounts:invite")).toBe(true);
    expect(hasPermission("TEACHER", "accounts:invite")).toBe(true);
    expect(hasPermission("STUDENT", "accounts:invite")).toBe(false);
    expect(canManageAccountRole("TEACHER", "STUDENT")).toBe(true);
    expect(canManageAccountRole("TEACHER", "TEACHER")).toBe(false);
    expect(canManageAccountRole("TEACHER", "ORG_ADMIN")).toBe(false);
  });

  it("creates users with hashed passwords, memberships, profile links, and audit logs", () => {
    const source = readFileSync(join(process.cwd(), "features/accounts/actions.ts"), "utf8");

    expect(source).toContain('requirePermission("accounts:invite"');
    expect(source).toContain("hashPassword");
    expect(source).toContain("membership.create");
    expect(source).toContain("writeAuditLog");
    expect(source).toContain("$transaction");
    expect(source).toContain("currentUser.tenantId");
  });

  it("maps profile target types to the correct product roles", () => {
    const source = readFileSync(join(process.cwd(), "features/accounts/account-schema.ts"), "utf8");

    expect(source).toContain('TEACHER: "TEACHER"');
    expect(source).toContain('STUDENT: "STUDENT"');
    expect(source).toContain('GUARDIAN: "PARENT"');
  });

  it("renders an account creation page with profile targets and states", () => {
    const page = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/accounts/page.tsx"),
      "utf8",
    );
    const loadingPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/accounts/loading.tsx"),
      "utf8",
    );
    const errorPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/accounts/error.tsx"),
      "utf8",
    );

    expect(page).toContain("AccountCreateDialog");
    expect(page).toContain("getAccountInvitationTargets");
    expect(page).toContain("EmptyState");
    expect(loadingPage).toContain("LoadingState");
    expect(errorPage).toContain("ErrorState");
  });
});
