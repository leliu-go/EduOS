import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("homework assignment", () => {
  it("validates title, instructions, due date, and one assignment target", async () => {
    const modulePath = "../features/homework/homework-schema";

    expect(existsSync(join(process.cwd(), "features/homework/homework-schema.ts"))).toBe(true);
    const { homeworkCreateSchema } = (await import(/* @vite-ignore */ modulePath)) as {
      homeworkCreateSchema: {
        safeParse: (input: unknown) => { success: boolean };
      };
    };

    expect(
      homeworkCreateSchema.safeParse({
        title: "每日练习",
        classGroupId: "cm00000000000000000000001",
        dueAt: "2026-05-21T18:00",
      }).success,
    ).toBe(false);
    expect(
      homeworkCreateSchema.safeParse({
        title: "每日练习",
        instructions: "完成讲义第 1-3 页。",
        classGroupId: "cm00000000000000000000001",
        dueAt: "2026-05-21T18:00",
      }).success,
    ).toBe(true);
  });

  it("creates homework through server validation, teacher scope checks, and audit logging", () => {
    const source = readFileSync(join(process.cwd(), "features/homework/actions.ts"), "utf8");

    expect(source).toContain("createHomeworkAction");
    expect(source).toContain("getHomeworkCreateValues");
    expect(source).toContain('requirePermission("homework:manage"');
    expect(source).toContain("canAssignHomeworkTarget");
    expect(source).toContain('currentUser.roleKey === "TEACHER"');
    expect(source).toContain("primaryTeacher");
    expect(source).toContain("teacher: {");
    expect(source).toContain("students: {");
    expect(source).toContain("tx.homework.create");
    expect(source).toContain("writeAuditLog");
    expect(source).toContain("homework.create");
  });

  it("loads staff and teacher homework assignment options with tenant scope", () => {
    const source = readFileSync(join(process.cwd(), "features/homework/queries.ts"), "utf8");

    expect(source).toContain("getHomeworkAssignmentOptions");
    expect(source).toContain("getStaffHomeworkList");
    expect(source).toContain("getTeacherHomeworkList");
    expect(source).toContain("tenantId");
    expect(source).toContain("teacherUserId");
    expect(source).toContain("primaryTeacher");
    expect(source).toContain("homework.findMany");
  });

  it("renders staff and teacher homework pages with loading, empty, and error states", () => {
    const files = [
      "app/(dashboard)/dashboard/homework/page.tsx",
      "app/(dashboard)/dashboard/homework/loading.tsx",
      "app/(dashboard)/dashboard/homework/error.tsx",
      "app/(mobile)/teacher/homework/page.tsx",
      "app/(mobile)/teacher/homework/loading.tsx",
      "app/(mobile)/teacher/homework/error.tsx",
    ];

    for (const file of files) {
      expect(existsSync(join(process.cwd(), file))).toBe(true);
    }

    if (!existsSync(join(process.cwd(), files[0])) || !existsSync(join(process.cwd(), files[3]))) {
      return;
    }

    const staffPage = readFileSync(join(process.cwd(), files[0]), "utf8");
    const teacherPage = readFileSync(join(process.cwd(), files[3]), "utf8");

    expect(staffPage).toContain('requirePermission("homework:manage"');
    expect(staffPage).toContain("HomeworkCreateDialog");
    expect(staffPage).toContain("getStaffHomeworkList");
    expect(teacherPage).toContain('requirePermission("homework:manage"');
    expect(teacherPage).toContain("HomeworkCreateDialog");
    expect(teacherPage).toContain("getTeacherHomeworkList");
    expect(readFileSync(join(process.cwd(), files[1]), "utf8")).toContain("LoadingState");
    expect(readFileSync(join(process.cwd(), files[2]), "utf8")).toContain("ErrorState");
    expect(readFileSync(join(process.cwd(), files[4]), "utf8")).toContain("LoadingState");
    expect(readFileSync(join(process.cwd(), files[5]), "utf8")).toContain("ErrorState");
  });

  it("links homework routes from navigation and protects them in e2e", () => {
    const sidebar = readFileSync(join(process.cwd(), "components/layout/app-sidebar.tsx"), "utf8");
    const mobileNav = readFileSync(
      join(process.cwd(), "components/layout/mobile-bottom-nav.tsx"),
      "utf8",
    );
    const e2eSource = readFileSync(join(process.cwd(), "tests/e2e/auth.spec.ts"), "utf8");

    expect(sidebar).toContain("/dashboard/homework");
    expect(mobileNav).toContain("/teacher/homework");
    expect(e2eSource).toContain("/dashboard/homework");
    expect(e2eSource).toContain("/teacher/homework");
  });
});
