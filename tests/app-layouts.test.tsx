import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardShell } from "../components/layout/dashboard-shell";
import { MobileShell } from "../components/layout/mobile-shell";

const mockedPathname = vi.hoisted(() => ({ value: "/student/homework" }));

vi.mock("next/navigation", () => ({
  usePathname: () => mockedPathname.value,
}));

describe("app layouts", () => {
  it("renders a polished desktop dashboard shell with sidebar and topbar controls", () => {
    mockedPathname.value = "/dashboard/courses";

    const { container } = render(
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
    expect(screen.getByRole("link", { name: /版本信息/ })).toHaveAttribute(
      "href",
      "/dashboard/settings/version",
    );
    expect(container.querySelector('a[href="/dashboard/courses"]')).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(container.querySelector('a[href="/dashboard"]')).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("heading", { name: "机构工作台" })).toBeInTheDocument();
  });

  it("keeps the dashboard sidebar scroll position across navigation", () => {
    window.sessionStorage.clear();
    mockedPathname.value = "/dashboard/settings/storage";

    const firstRender = render(
      <DashboardShell>
        <h1>机构工作台</h1>
      </DashboardShell>,
    );

    const sidebarNav = firstRender.container.querySelector("[data-eduos-sidebar-nav]");
    expect(sidebarNav).toBeInstanceOf(HTMLElement);

    if (!(sidebarNav instanceof HTMLElement)) {
      return;
    }

    sidebarNav.scrollTop = 280;
    fireEvent.scroll(sidebarNav);
    firstRender.unmount();

    mockedPathname.value = "/dashboard/help";

    const secondRender = render(
      <DashboardShell>
        <h1>帮助文档</h1>
      </DashboardShell>,
    );

    const restoredSidebarNav = secondRender.container.querySelector("[data-eduos-sidebar-nav]");
    expect(restoredSidebarNav).toBeInstanceOf(HTMLElement);
    expect((restoredSidebarNav as HTMLElement).scrollTop).toBe(280);
  });

  it("renders student mobile shell with role-specific bottom navigation", () => {
    mockedPathname.value = "/student/homework";

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
    expect(within(navigation).getByRole("link", { name: "课表" })).toHaveAttribute(
      "href",
      "/student/schedule",
    );
    expect(within(navigation).getByRole("link", { name: "作业" })).toHaveAttribute(
      "href",
      "/student/homework",
    );
    expect(within(navigation).getByRole("link", { name: "作业" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(navigation).getByRole("link", { name: "错题" })).toHaveAttribute(
      "href",
      "/student/mistakes",
    );
    expect(within(navigation).getByRole("link", { name: "我的" })).toHaveAttribute(
      "href",
      "/student/me",
    );
    expect(within(navigation).queryByRole("link", { name: "资源" })).not.toBeInTheDocument();
  });

  it("renders teacher and parent mobile shells with separate nav labels", () => {
    mockedPathname.value = "/teacher/classes";

    const { rerender } = render(
      <MobileShell role="teacher" title="老师端" summary="今日授课">
        <h1>老师首页</h1>
      </MobileShell>,
    );

    const teacherNavigation = screen.getByRole("navigation", { name: "老师端导航" });
    expect(within(teacherNavigation).getByRole("link", { name: "班级" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(teacherNavigation).getByRole("link", { name: "我的" })).toHaveAttribute(
      "href",
      "/teacher/me",
    );
    expect(within(teacherNavigation).queryByRole("link", { name: "资源" })).not.toBeInTheDocument();

    mockedPathname.value = "/parent/reports";

    rerender(
      <MobileShell role="parent" title="家长端" summary="孩子动态">
        <h1>家长首页</h1>
      </MobileShell>,
    );

    const parentNavigation = screen.getByRole("navigation", { name: "家长端导航" });
    expect(within(parentNavigation).getByRole("link", { name: "课消" })).toBeInTheDocument();
    expect(within(parentNavigation).getByRole("link", { name: "报告" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
