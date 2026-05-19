import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  getScheduleCalendarHref,
  getScheduleCalendarSearch,
  getScheduleCalendarWindow,
} from "../features/scheduling/calendar";
import { hasPermission } from "../lib/rbac/permissions";

describe("scheduling calendar UI", () => {
  it("normalizes calendar views, dates, and filters", () => {
    const search = getScheduleCalendarSearch(
      {
        view: "day",
        date: "2026-09-02",
        campusId: "campus-1",
        teacherId: "all",
        roomId: "room-1",
        classGroupId: "class-1",
      },
      new Date("2026-01-10T00:00:00.000Z"),
    );

    expect(search).toEqual({
      view: "day",
      date: "2026-09-02",
      filters: {
        campusId: "campus-1",
        roomId: "room-1",
        classGroupId: "class-1",
      },
    });

    expect(
      getScheduleCalendarSearch(
        {
          view: "bad-view",
          date: "bad-date",
          campusId: "all",
        },
        new Date("2026-01-10T00:00:00.000Z"),
      ),
    ).toEqual({
      view: "week",
      date: "2026-01-10",
      filters: {},
    });
  });

  it("builds day, week, and list windows", () => {
    expect(getScheduleCalendarWindow({ view: "day", date: "2026-09-02", filters: {} })).toEqual({
      startAt: new Date("2026-09-02T00:00:00.000Z"),
      endAt: new Date("2026-09-03T00:00:00.000Z"),
    });

    expect(getScheduleCalendarWindow({ view: "week", date: "2026-09-02", filters: {} })).toEqual({
      startAt: new Date("2026-08-31T00:00:00.000Z"),
      endAt: new Date("2026-09-07T00:00:00.000Z"),
    });

    expect(getScheduleCalendarWindow({ view: "list", date: "2026-09-02", filters: {} })).toEqual({
      startAt: new Date("2026-09-02T00:00:00.000Z"),
      endAt: new Date("2026-10-02T00:00:00.000Z"),
    });
  });

  it("keeps internal scheduling calendar staff-only", () => {
    expect(hasPermission("ORG_ADMIN", "route:scheduling")).toBe(true);
    expect(hasPermission("CAMPUS_ADMIN", "route:scheduling")).toBe(true);
    expect(hasPermission("ACADEMIC", "route:scheduling")).toBe(true);
    expect(hasPermission("TEACHER", "route:scheduling")).toBe(false);
    expect(hasPermission("STUDENT", "route:scheduling")).toBe(false);
    expect(hasPermission("PARENT", "route:scheduling")).toBe(false);
  });

  it("renders scheduling page with calendar views, filters, and route states", () => {
    const page = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/scheduling/page.tsx"),
      "utf8",
    );
    const loading = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/scheduling/loading.tsx"),
      "utf8",
    );
    const error = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/scheduling/error.tsx"),
      "utf8",
    );
    const queries = readFileSync(join(process.cwd(), "features/scheduling/queries.ts"), "utf8");
    const sidebar = readFileSync(join(process.cwd(), "components/layout/app-sidebar.tsx"), "utf8");

    expect(page).toContain('requirePermission("route:scheduling"');
    expect(page).toContain("getScheduleCalendarData");
    expect(page).toContain("Tabs");
    expect(page).toContain('value="day"');
    expect(page).toContain('value="week"');
    expect(page).toContain('value="list"');
    expect(page).toContain('name="campusId"');
    expect(page).toContain('name="teacherId"');
    expect(page).toContain('name="roomId"');
    expect(page).toContain('name="classGroupId"');
    expect(page).toContain("EmptyState");
    expect(queries).toContain("tenantId");
    expect(queries).toContain("prisma.schedule.findMany");
    expect(queries).toContain("classGroupId");
    expect(queries).toContain("teacherId");
    expect(queries).toContain("campusId");
    expect(queries).toContain("roomId");
    expect(loading).toContain("LoadingState");
    expect(error).toContain("ErrorState");
    expect(sidebar).toContain('href: "/dashboard/scheduling"');
  });

  it("keeps calendar links scoped to the current filters", () => {
    expect(
      getScheduleCalendarHref({
        view: "list",
        date: "2026-09-02",
        filters: {
          campusId: "campus-1",
          teacherId: "teacher-1",
        },
      }),
    ).toBe("/dashboard/scheduling?view=list&date=2026-09-02&campusId=campus-1&teacherId=teacher-1");
  });
});
