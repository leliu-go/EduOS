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
    const globalsPath = "app/globals.css";

    expect(existsSync(join(rootDir, sidebarPath))).toBe(true);
    expect(existsSync(join(rootDir, globalsPath))).toBe(true);

    const source = readProjectFile(sidebarPath);
    const globals = readProjectFile(globalsPath);
    const dashboardHrefCount = (source.match(/href: "\/dashboard"/g) ?? []).length;

    expect(source).toContain("工作台");
    expect(source).not.toContain("数据看板");
    expect(dashboardHrefCount).toBe(1);
    expect(source).toContain("/dashboard/settings/version");
    expect(source).toContain("getAppVersion");
    expect(source).toContain("data-eduos-sidebar");
    expect(source).toContain("data-eduos-sidebar-link");
    expect(source).not.toContain("hidden min-h-screen");
    expect(source).not.toContain("md:flex md:flex-col");
    expect(source).not.toContain("lg:flex lg:flex-col");
    expect(globals).toContain('@source "../components";');
    expect(globals).toContain('@source "../features";');
    expect(globals).toContain("[data-eduos-sidebar]");
    expect(globals).toContain("width: 16rem");
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
