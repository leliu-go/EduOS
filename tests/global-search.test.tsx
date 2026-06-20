import { render, screen } from "@testing-library/react";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

import { DashboardShell } from "../components/layout/dashboard-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("global search", () => {
  it("uses role-aware tenant-scoped queries for students, teachers, classes, and courses", () => {
    const sourcePath = join(process.cwd(), "features/search/global-search.ts");

    expect(existsSync(sourcePath)).toBe(true);
    if (!existsSync(sourcePath)) {
      return;
    }

    const source = readFileSync(sourcePath, "utf8");

    expect(source).toContain("getDashboardGlobalSearch");
    expect(source).toContain('hasPermission(currentUser.roleKey, "students:manage")');
    expect(source).toContain('hasPermission(currentUser.roleKey, "teachers:manage")');
    expect(source).toContain('hasPermission(currentUser.roleKey, "classes:manage")');
    expect(source).toContain('hasPermission(currentUser.roleKey, "courses:manage")');
    expect(source).toContain("tenantId: currentUser.tenantId");
    expect(source).toContain("prisma.studentProfile.findMany");
    expect(source).toContain("prisma.teacherProfile.findMany");
    expect(source).toContain("prisma.classGroup.findMany");
    expect(source).toContain("prisma.courseProduct.findMany");
    expect(source).toContain("take: globalSearchTake");
  });

  it("submits topbar search to the dashboard search page", () => {
    render(
      <DashboardShell>
        <h1>机构工作台</h1>
      </DashboardShell>,
    );

    const searchbox = screen.getByRole("searchbox", { name: "全局搜索" });

    expect(searchbox).toHaveAttribute("name", "q");
    expect(searchbox).toHaveAttribute("placeholder", "搜索学生、教师、班级、课程");
    expect(screen.getByRole("search")).toHaveAttribute("action", "/dashboard/search");
    expect(screen.getByRole("button", { name: "搜索" })).toBeInTheDocument();
  });

  it("renders the protected dashboard search page and route states", () => {
    const pagePath = join(process.cwd(), "app/(dashboard)/dashboard/search/page.tsx");

    expect(existsSync(pagePath)).toBe(true);
    if (!existsSync(pagePath)) {
      return;
    }

    const page = readFileSync(pagePath, "utf8");

    expect(page).toContain('requirePermission("route:dashboard"');
    expect(page).toContain("getDashboardGlobalSearch");
    expect(page).toContain("searchParams");
    for (const copy of ["学生", "老师", "班级", "课程", "暂无搜索结果"]) {
      expect(page).toContain(copy);
    }

    for (const routeFile of [
      "app/(dashboard)/dashboard/search/loading.tsx",
      "app/(dashboard)/dashboard/search/error.tsx",
    ]) {
      expect(existsSync(join(process.cwd(), routeFile))).toBe(true);
    }
  });
});
