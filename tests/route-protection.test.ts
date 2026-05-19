import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const routeLayouts = [
  {
    file: "app/(dashboard)/layout.tsx",
    permission: 'requirePermission("route:dashboard"',
    nextPath: 'nextPath: "/dashboard"',
  },
  {
    file: "app/(mobile)/student/layout.tsx",
    permission: 'requirePermission("route:student"',
    nextPath: 'nextPath: "/student"',
  },
  {
    file: "app/(mobile)/teacher/layout.tsx",
    permission: 'requirePermission("route:teacher"',
    nextPath: 'nextPath: "/teacher"',
  },
  {
    file: "app/(mobile)/parent/layout.tsx",
    permission: 'requirePermission("route:parent"',
    nextPath: 'nextPath: "/parent"',
  },
];

describe("route protection", () => {
  it("protects each role route group with the matching permission", () => {
    for (const routeLayout of routeLayouts) {
      const source = readFileSync(join(process.cwd(), routeLayout.file), "utf8");

      expect(source).toContain(routeLayout.permission);
      expect(source).toContain(routeLayout.nextPath);
      expect(source).toContain('unauthorizedRedirectTo: "/unauthorized"');
    }
  });

  it("has a clear unauthorized access page", () => {
    const source = readFileSync(join(process.cwd(), "app/unauthorized/page.tsx"), "utf8");

    expect(source).toContain("无权访问");
    expect(source).toContain("当前账号没有访问该页面的权限");
  });
});
