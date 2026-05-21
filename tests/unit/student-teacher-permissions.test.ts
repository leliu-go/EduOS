import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { hasPermission } from "../../lib/rbac/permissions";

describe("student and teacher portal permission boundaries", () => {
  it("keeps students inside their own learning app", () => {
    expect(hasPermission("STUDENT", "route:student")).toBe(true);
    expect(hasPermission("STUDENT", "homework:submit")).toBe(true);
    expect(hasPermission("STUDENT", "mistakes:viewOwn")).toBe(true);
    expect(hasPermission("STUDENT", "resources:download")).toBe(true);

    expect(hasPermission("STUDENT", "route:teacher")).toBe(false);
    expect(hasPermission("STUDENT", "route:dashboard")).toBe(false);
    expect(hasPermission("STUDENT", "route:finance")).toBe(false);
    expect(hasPermission("STUDENT", "finance:reports:view")).toBe(false);
    expect(hasPermission("STUDENT", "finance:mutate")).toBe(false);
    expect(hasPermission("STUDENT", "resources:manage")).toBe(false);
  });

  it("keeps teachers inside teaching execution surfaces", () => {
    expect(hasPermission("TEACHER", "route:teacher")).toBe(true);
    expect(hasPermission("TEACHER", "homework:manage")).toBe(true);
    expect(hasPermission("TEACHER", "homework:correct")).toBe(true);
    expect(hasPermission("TEACHER", "lessonFeedback:manage")).toBe(true);

    expect(hasPermission("TEACHER", "route:dashboard")).toBe(false);
    expect(hasPermission("TEACHER", "route:finance")).toBe(false);
    expect(hasPermission("TEACHER", "finance:reports:view")).toBe(false);
    expect(hasPermission("TEACHER", "finance:mutate")).toBe(false);
    expect(hasPermission("TEACHER", "security:policy:manage")).toBe(false);
  });

  it("guards mobile portal routes on the server", () => {
    const studentLayout = readFileSync("app/(mobile)/student/layout.tsx", "utf8");
    const teacherLayout = readFileSync("app/(mobile)/teacher/layout.tsx", "utf8");
    const studentMe = readFileSync("app/(mobile)/student/me/page.tsx", "utf8");
    const teacherMe = readFileSync("app/(mobile)/teacher/me/page.tsx", "utf8");

    expect(studentLayout).toContain('requirePermission("route:student"');
    expect(teacherLayout).toContain('requirePermission("route:teacher"');
    expect(studentMe).toContain('requirePermission("route:student"');
    expect(teacherMe).toContain('requirePermission("route:teacher"');
  });

  it("does not let the service worker cache role-private mobile data", () => {
    const serviceWorker = readFileSync("public/sw.js", "utf8");

    expect(serviceWorker).toContain('"/api/"');
    expect(serviceWorker).toContain('"/teacher"');
    expect(serviceWorker).toContain('"/student"');
    expect(serviceWorker).toContain('"/parent"');
    expect(serviceWorker).toContain("networkOnly(request)");
  });
});
