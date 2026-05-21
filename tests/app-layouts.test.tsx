import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardShell } from "../components/layout/dashboard-shell";
import { MobileShell } from "../components/layout/mobile-shell";

describe("app layouts", () => {
  it("renders a polished desktop dashboard shell with sidebar and topbar controls", () => {
    render(
      <DashboardShell>
        <h1>机构工作台</h1>
      </DashboardShell>,
    );

    expect(screen.getByRole("navigation", { name: "主导航" })).toBeInTheDocument();
    expect(screen.getByText("教培运营系统")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "学习任务" })).toHaveAttribute(
      "href",
      "/dashboard/learning",
    );
    expect(screen.getByPlaceholderText("搜索学生、教师、班级、课程")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "当前校区：全部校区" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "通知" })).toHaveAttribute(
      "href",
      "/dashboard/notifications",
    );
    expect(screen.getByRole("heading", { name: "机构工作台" })).toBeInTheDocument();
  });

  it("renders student mobile shell with role-specific bottom navigation", () => {
    render(
      <MobileShell role="student" title="学生端" summary="今日学习">
        <h1>学生首页</h1>
      </MobileShell>,
    );

    const navigation = screen.getByRole("navigation", { name: "学生端导航" });
    expect(within(navigation).getByRole("link", { name: "首页" })).toHaveAttribute(
      "href",
      "/student",
    );
    expect(within(navigation).getByRole("link", { name: "课表" })).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "作业" })).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "错题" })).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "资源" })).toHaveAttribute(
      "href",
      "/student/resources",
    );
  });

  it("renders teacher and parent mobile shells with separate nav labels", () => {
    const { rerender } = render(
      <MobileShell role="teacher" title="教师端" summary="今日授课">
        <h1>教师首页</h1>
      </MobileShell>,
    );

    expect(screen.getByRole("navigation", { name: "教师端导航" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "班级" })).toBeInTheDocument();

    rerender(
      <MobileShell role="parent" title="家长端" summary="孩子动态">
        <h1>家长首页</h1>
      </MobileShell>,
    );

    expect(screen.getByRole("navigation", { name: "家长端导航" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "课消" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "报告" })).toBeInTheDocument();
  });
});
