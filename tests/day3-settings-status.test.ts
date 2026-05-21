import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("Day 3 settings and productization status", () => {
  it("adds safe settings center and storage status pages", () => {
    for (const path of [
      "app/(dashboard)/dashboard/settings/page.tsx",
      "app/(dashboard)/dashboard/settings/storage/page.tsx",
      "app/(dashboard)/dashboard/settings/security/page.tsx",
    ]) {
      expect(existsSync(join(rootDir, path))).toBe(true);
    }

    const settingsPage = readProjectFile("app/(dashboard)/dashboard/settings/page.tsx");
    const storagePage = readProjectFile("app/(dashboard)/dashboard/settings/storage/page.tsx");
    const securityPage = readProjectFile("app/(dashboard)/dashboard/settings/security/page.tsx");

    expect(settingsPage).toContain('requirePermission("route:admin"');
    expect(settingsPage).toContain("版本与更新");
    expect(settingsPage).toContain("存储状态");
    expect(settingsPage).toContain("安全中心");
    expect(storagePage).toContain("validateProductionEnv");
    expect(storagePage).toContain("AccessKeySecret");
    expect(storagePage).toContain("不展示");
    expect(storagePage).not.toContain(".env.production.local");
    expect(securityPage).toContain("MFA");
    expect(securityPage).toContain("审计日志");
  });
});
