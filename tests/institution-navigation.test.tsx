import { render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { DashboardShell } from "../components/layout/dashboard-shell";

describe("institution navigation polish", () => {
  it("groups desktop navigation by institution workflows", () => {
    render(
      <DashboardShell>
        <h1>机构工作台</h1>
      </DashboardShell>,
    );

    const navigation = screen.getByRole("navigation", { name: "主导航" });

    for (const group of ["首页", "招生", "教务", "教学", "财务", "设置"]) {
      expect(within(navigation).getByText(group)).toBeInTheDocument();
    }

    expect(within(navigation).queryByText("数据")).not.toBeInTheDocument();
    expect(within(navigation).queryByRole("link", { name: "数据看板" })).not.toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "招生 CRM" })).toHaveAttribute(
      "href",
      "/dashboard/enrollments",
    );
    expect(within(navigation).getByRole("link", { name: "排课" })).toHaveAttribute(
      "href",
      "/dashboard/scheduling",
    );
    expect(within(navigation).getByRole("link", { name: "作业" })).toHaveAttribute(
      "href",
      "/dashboard/homework",
    );
    expect(within(navigation).getByRole("link", { name: "支付流水" })).toHaveAttribute(
      "href",
      "/dashboard/payments",
    );
    expect(within(navigation).getByRole("link", { name: "版本信息" })).toHaveAttribute(
      "href",
      "/dashboard/settings/version",
    );
    expect(within(navigation).getByRole("link", { name: "帮助文档" })).toHaveAttribute(
      "href",
      "/dashboard/help",
    );
  });

  it("keeps sidebar routes explicit without placeholder links", () => {
    const source = readFileSync(join(process.cwd(), "components/layout/app-sidebar.tsx"), "utf8");

    expect(source).toContain("sidebarGroups");
    expect(source).not.toContain('href: "#"');
    expect(source).not.toContain("数据看板");
    for (const href of [
      "/dashboard",
      "/dashboard/enrollments",
      "/dashboard/scheduling",
      "/dashboard/resources",
      "/dashboard/payments",
      "/dashboard/finance-reports",
      "/dashboard/accounts",
      "/dashboard/settings/version",
      "/dashboard/help",
    ]) {
      expect(source).toContain(`href: "${href}"`);
    }
  });
});
