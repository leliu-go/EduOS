import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardDemo } from "../features/dashboard/dashboard-demo";
import { dashboardDemoData } from "../features/dashboard/mock-dashboard-data";

describe("dashboard demo", () => {
  it("keeps dashboard preview data isolated from the page component", () => {
    expect(dashboardDemoData.metrics.map((metric) => metric.label)).toEqual([
      "今日课程",
      "今日到课率",
      "本月课消",
      "待批改作业",
      "低课时预警",
      "本周排课",
    ]);
  });

  it("renders the required dashboard metric cards", () => {
    render(<DashboardDemo />);

    expect(screen.getByRole("heading", { name: "机构工作台" })).toBeInTheDocument();
    for (const label of dashboardDemoData.metrics.map((metric) => metric.label)) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });
});
