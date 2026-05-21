import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("Day 3 navigation and workbench UX", () => {
  it("does not keep duplicate dashboard/data-dashboard entries in the sidebar", () => {
    const sidebarPath = "components/layout/app-sidebar.tsx";

    expect(existsSync(join(rootDir, sidebarPath))).toBe(true);

    const source = readProjectFile(sidebarPath);
    const dashboardHrefCount = (source.match(/href: "\/dashboard"/g) ?? []).length;

    expect(source).toContain("工作台");
    expect(source).not.toContain("数据看板");
    expect(dashboardHrefCount).toBe(1);
    expect(source).toContain("/dashboard/settings/version");
    expect(source).toContain("getAppVersion");
  });

  it("documents the new navigation split between workbench and future analytics", () => {
    const docPath = "docs/NAVIGATION_STRUCTURE.md";

    expect(existsSync(join(rootDir, docPath))).toBe(true);

    const source = readProjectFile(docPath);

    expect(source).toContain("工作台");
    expect(source).toContain("经营分析");
    expect(source).toContain("不再保留重复的数据看板入口");
    expect(source).toContain("学生、家长、老师不能进入机构工作台");
  });
});
