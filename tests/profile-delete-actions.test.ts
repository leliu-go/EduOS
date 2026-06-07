import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("student and teacher delete actions", () => {
  it("keeps destructive profile deletion as a confirmed soft-delete", () => {
    const studentForm = readFileSync(
      join(process.cwd(), "features/students/student-delete-form.tsx"),
      "utf8",
    );
    const teacherForm = readFileSync(
      join(process.cwd(), "features/teachers/teacher-delete-form.tsx"),
      "utf8",
    );

    expect(studentForm).toContain('"use client"');
    expect(studentForm).toContain("window.confirm");
    expect(studentForm).toContain("deleteStudentAction");
    expect(studentForm).toContain('variant="destructive"');
    expect(teacherForm).toContain('"use client"');
    expect(teacherForm).toContain("window.confirm");
    expect(teacherForm).toContain("deleteTeacherAction");
    expect(teacherForm).toContain('variant="destructive"');
  });

  it("hides soft-deleted students and teachers from default lists", () => {
    const studentQueries = readFileSync(join(process.cwd(), "features/students/queries.ts"), "utf8");
    const teacherQueries = readFileSync(join(process.cwd(), "features/teachers/queries.ts"), "utf8");

    expect(studentQueries).toContain("where.status");
    expect(studentQueries).toContain('not: "WITHDRAWN"');
    expect(teacherQueries).toContain("where.status");
    expect(teacherQueries).toContain('not: "RESIGNED"');
  });
});
