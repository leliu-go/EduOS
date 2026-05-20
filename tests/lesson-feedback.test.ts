import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("lesson feedback", () => {
  it("adds a tenant-scoped lesson feedback model per lesson and student", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("model LessonFeedback");
    expect(schema).toMatch(/lessonId\s+String/);
    expect(schema).toMatch(/studentId\s+String/);
    expect(schema).toMatch(/teacherId\s+String/);
    expect(schema).toMatch(/content\s+String/);
    expect(schema).toMatch(/performance\s+String/);
    expect(schema).toMatch(/mastery\s+String/);
    expect(schema).toMatch(/homework\s+String/);
    expect(schema).toMatch(/suggestion\s+String/);
    expect(schema).toContain("@@unique([tenantId, lessonId, studentId])");
    expect(schema).toContain("@@index([tenantId, studentId])");
    expect(schema).toContain("@@index([tenantId, teacherId])");
  });

  it("validates all lesson feedback fields", async () => {
    const modulePath = "../features/lesson-feedback/lesson-feedback-schema";
    const schemaModule = (await import(/* @vite-ignore */ modulePath).catch(() => null)) as {
      getLessonFeedbackValues?: (formData: FormData) =>
        | {
            success: true;
            data: {
              lessonId: string;
              studentId: string;
              content: string;
              performance: string;
              mastery: string;
              homework: string;
              suggestion: string;
            };
          }
        | { success: false };
    } | null;

    expect(schemaModule?.getLessonFeedbackValues).toBeTypeOf("function");
    if (!schemaModule?.getLessonFeedbackValues) {
      return;
    }

    const formData = new FormData();
    formData.set("lessonId", "cm00000000000000000000001");
    formData.set("studentId", "cm00000000000000000000002");
    formData.set("content", "完成方程移项练习。");
    formData.set("performance", "课堂表达积极。");
    formData.set("mastery", "移项法掌握良好。");
    formData.set("homework", "完成课后第 3 页。");
    formData.set("suggestion", "继续保持步骤书写。");
    formData.set("returnTo", "/teacher/lessons/cm00000000000000000000001");

    const parsed = schemaModule.getLessonFeedbackValues(formData);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.content).toBe("完成方程移项练习。");
      expect(parsed.data.suggestion).toBe("继续保持步骤书写。");
    }

    formData.set("mastery", "");
    expect(schemaModule.getLessonFeedbackValues(formData).success).toBe(false);
  });

  it("writes feedback through authorized teacher action with audit log", () => {
    const actionPath = join(process.cwd(), "features/lesson-feedback/actions.ts");

    expect(existsSync(actionPath)).toBe(true);
    if (!existsSync(actionPath)) {
      return;
    }

    const source = readFileSync(actionPath, "utf8");

    expect(source).toContain("createOrUpdateLessonFeedbackAction");
    expect(source).toContain('requirePermission("lessonFeedback:manage"');
    expect(source).toContain('currentUser.roleKey === "TEACHER"');
    expect(source).toContain("teacher: {");
    expect(source).toContain("userId: currentUser.id");
    expect(source).toContain("classGroups");
    expect(source).toContain("upsert");
    expect(source).toContain("writeAuditLog");
    expect(source).toContain("lessonFeedback.upsert");
    expect(source).toContain('revalidatePath("/parent"');
  });

  it("queries teacher lesson context and parent-visible feedback", () => {
    const queryPath = join(process.cwd(), "features/lesson-feedback/queries.ts");

    expect(existsSync(queryPath)).toBe(true);
    if (!existsSync(queryPath)) {
      return;
    }

    const source = readFileSync(queryPath, "utf8");

    expect(source).toContain("getTeacherLessonFeedbackContext");
    expect(source).toContain("getParentLessonFeedback");
    expect(source).toContain("lessonFeedbacks");
    expect(source).toContain("guardians");
    expect(source).toContain("parentUserId");
    expect(source).toContain("teacher");
    expect(source).toContain("student");
  });

  it("renders teacher feedback form and parent feedback cards", () => {
    const teacherPage = readFileSync(
      join(process.cwd(), "app/(mobile)/teacher/lessons/[lessonId]/page.tsx"),
      "utf8",
    );
    const parentPage = readFileSync(join(process.cwd(), "app/(mobile)/parent/page.tsx"), "utf8");
    const formPath = join(process.cwd(), "features/lesson-feedback/lesson-feedback-form.tsx");

    expect(existsSync(formPath)).toBe(true);
    if (!existsSync(formPath)) {
      return;
    }

    const formSource = readFileSync(formPath, "utf8");

    expect(teacherPage).toContain("getTeacherLessonFeedbackContext");
    expect(teacherPage).toContain("LessonFeedbackForm");
    expect(teacherPage).toContain("课后反馈");
    expect(parentPage).toContain("getParentLessonFeedback");
    expect(parentPage).toContain("课后反馈");
    for (const field of ["content", "performance", "mastery", "homework", "suggestion"]) {
      expect(formSource).toContain(`name: "${field}"`);
    }
  });
});
