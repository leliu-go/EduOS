import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { hasPermission } from "@/lib/rbac/permissions";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("admin account management", () => {
  it("allows admins to disable, enable, and soft-delete accounts server-side", () => {
    expect(hasPermission("ORG_ADMIN", "accounts:disable")).toBe(true);
    expect(hasPermission("SUPER_ADMIN", "accounts:delete")).toBe(true);
    expect(hasPermission("TEACHER", "accounts:disable")).toBe(false);
    expect(hasPermission("STUDENT", "accounts:delete")).toBe(false);

    const actions = readProjectFile("features/accounts/actions.ts");

    expect(actions).toContain("disableAccountAction");
    expect(actions).toContain("enableAccountAction");
    expect(actions).toContain("deleteAccountAction");
    expect(actions).toContain('requirePermission("accounts:disable"');
    expect(actions).toContain('requirePermission("accounts:delete"');
    expect(actions).toContain("account.disable");
    expect(actions).toContain("account.enable");
    expect(actions).toContain("account.delete_soft");
  });

  it("surfaces account lifecycle controls in the account directory UI", () => {
    const page = readProjectFile("app/(dashboard)/dashboard/accounts/page.tsx");

    expect(page).toContain("disableAccountAction");
    expect(page).toContain("enableAccountAction");
    expect(page).toContain("deleteAccountAction");
    expect(page).toContain("禁用");
    expect(page).toContain("启用");
    expect(page).toContain("删除");
    expect(page).toContain("导出账号 CSV");
    expect(page).toContain("下载导入模板");
  });
});
