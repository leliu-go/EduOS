import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function getFunctionSource(source: string, functionName: string) {
  const start = source.indexOf(`function ${functionName}`);
  const next = source.indexOf("\nexport async function", start + 1);

  return source.slice(start, next === -1 ? undefined : next);
}

describe("student teacher parent timetables", () => {
  it("reads student timetable by own student profile without room allocation details", () => {
    const source = readFileSync(
      join(process.cwd(), "features/scheduling/portal-queries.ts"),
      "utf8",
    );
    const studentQuery = getFunctionSource(source, "getStudentTimetable");

    expect(studentQuery).toContain("tenantId");
    expect(studentQuery).toContain("student:");
    expect(studentQuery).toContain("userId");
    expect(studentQuery).toContain("prisma.schedule.findMany");
    expect(studentQuery).toContain("campus: true");
    expect(studentQuery).not.toContain("room:");
  });

  it("reads teacher timetable by teacher user only", () => {
    const source = readFileSync(
      join(process.cwd(), "features/scheduling/portal-queries.ts"),
      "utf8",
    );
    const teacherQuery = getFunctionSource(source, "getTeacherTimetable");

    expect(teacherQuery).toContain("tenantId");
    expect(teacherQuery).toContain("teacher:");
    expect(teacherQuery).toContain("userId");
    expect(teacherQuery).toContain("room: true");
  });

  it("reads parent timetable only for bound students", () => {
    const source = readFileSync(
      join(process.cwd(), "features/scheduling/portal-queries.ts"),
      "utf8",
    );
    const parentQuery = getFunctionSource(source, "getParentTimetable");

    expect(parentQuery).toContain("guardians:");
    expect(parentQuery).toContain("guardian:");
    expect(parentQuery).toContain("userId");
    expect(parentQuery).not.toContain("room:");
  });

  it("renders mobile timetable cards for student, teacher, and parent portals", () => {
    const teacherDashboardSource = readFileSync(
      join(process.cwd(), "features/reports/teacher-class-dashboard.ts"),
      "utf8",
    );
    const studentPage = readFileSync(join(process.cwd(), "app/(mobile)/student/page.tsx"), "utf8");
    const teacherPage = readFileSync(join(process.cwd(), "app/(mobile)/teacher/page.tsx"), "utf8");
    const parentPage = readFileSync(join(process.cwd(), "app/(mobile)/parent/page.tsx"), "utf8");

    expect(studentPage).toContain("getStudentTimetable");
    expect(studentPage).toContain("TimetableCard");
    expect(studentPage).not.toContain("room.name");
    expect(teacherDashboardSource).toContain("prisma.schedule.findMany");
    expect(teacherDashboardSource).toContain("teacher:");
    expect(teacherDashboardSource).toContain("userId: teacherUserId");
    expect(teacherDashboardSource).toContain("room: true");
    expect(teacherPage).toContain("dashboard.todayLessons");
    expect(teacherPage).toContain("TimetableCard");
    expect(teacherPage).toContain("room.name");
    expect(parentPage).toContain("getParentTimetable");
    expect(parentPage).toContain("studentNames");
    expect(parentPage).not.toContain("room.name");
  });
});
