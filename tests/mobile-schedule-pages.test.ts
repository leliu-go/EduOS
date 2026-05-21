import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readProjectFile(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

function getFunctionSource(source: string, functionName: string) {
  const start = source.indexOf(`function ${functionName}`);
  const next = source.indexOf("\nexport async function", start + 1);

  return source.slice(start, next === -1 ? undefined : next);
}

describe("mobile schedule pages", () => {
  it("provides pages for every mobile schedule navigation entry", () => {
    const navSource = readProjectFile("components/mobile/BottomNav.tsx");

    for (const route of ["/student/schedule", "/teacher/schedule", "/parent/schedule"]) {
      expect(navSource).toContain(`href: "${route}"`);
      expect(existsSync(join(process.cwd(), `app/(mobile)${route}/page.tsx`))).toBe(true);
      expect(existsSync(join(process.cwd(), `app/(mobile)${route}/loading.tsx`))).toBe(true);
      expect(existsSync(join(process.cwd(), `app/(mobile)${route}/error.tsx`))).toBe(true);
    }
  });

  it("renders role-scoped timetables with server permission checks", () => {
    const studentPage = readProjectFile("app/(mobile)/student/schedule/page.tsx");
    const teacherPage = readProjectFile("app/(mobile)/teacher/schedule/page.tsx");
    const parentPage = readProjectFile("app/(mobile)/parent/schedule/page.tsx");

    expect(studentPage).toContain('requirePermission("route:student"');
    expect(studentPage).toContain("getStudentTimetable(currentUser.tenantId, currentUser.id)");
    expect(studentPage).toContain("TimetableCard");
    expect(studentPage).toContain("EmptyState");
    expect(studentPage).not.toContain("room.name");

    expect(teacherPage).toContain('requirePermission("route:teacher"');
    expect(teacherPage).toContain("getTeacherTimetable(currentUser.tenantId, currentUser.id)");
    expect(teacherPage).toContain("TimetableCard");
    expect(teacherPage).toContain("EmptyState");
    expect(teacherPage).toContain("roomName={schedule.room.name}");

    expect(parentPage).toContain('requirePermission("route:parent"');
    expect(parentPage).toContain("getParentTimetable(currentUser.tenantId, currentUser.id)");
    expect(parentPage).toContain("TimetableCard");
    expect(parentPage).toContain("EmptyState");
    expect(parentPage).toContain("studentNames");
    expect(parentPage).not.toContain("room.name");
  });

  it("keeps parent timetable guardian filters tenant-scoped", () => {
    const source = readProjectFile("features/scheduling/portal-queries.ts");
    const parentQuery = getFunctionSource(source, "getParentTimetable");

    expect(parentQuery).toContain("guardian:");
    expect(parentQuery).toContain("tenantId");
    expect(parentQuery).toMatch(/guardian:\s*{\s*tenantId,\s*userId,/);
  });
});
