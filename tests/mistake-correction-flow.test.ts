import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("mistake correction flow", () => {
  it("validates mistake correction form values", async () => {
    const modulePath = "../features/mistakes/error-record-schema";
    const schemaModule = (await import(/* @vite-ignore */ modulePath)) as {
      getMistakeCorrectionValues?: (formData: FormData) =>
        | {
            success: true;
            data: { errorRecordId: string; returnTo: string };
          }
        | { success: false };
    };

    expect(schemaModule.getMistakeCorrectionValues).toBeTypeOf("function");
    if (!schemaModule.getMistakeCorrectionValues) {
      return;
    }

    const valid = new FormData();
    valid.set("errorRecordId", "cm00000000000000000000001");
    valid.set("returnTo", "/student/mistakes");

    const parsed = schemaModule.getMistakeCorrectionValues(valid);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({
        errorRecordId: "cm00000000000000000000001",
        returnTo: "/student/mistakes",
      });
    }

    const invalid = new FormData();
    invalid.set("errorRecordId", "bad-id");
    invalid.set("returnTo", "/dashboard/mistakes");

    expect(schemaModule.getMistakeCorrectionValues(invalid).success).toBe(false);
  });

  it("updates mistake status through scoped server actions with audit logs", () => {
    const actionPath = join(process.cwd(), "features/mistakes/actions.ts");

    expect(existsSync(actionPath)).toBe(true);
    if (!existsSync(actionPath)) {
      return;
    }

    const source = readFileSync(actionPath, "utf8");

    expect(source).toContain("submitMistakeCorrectionAction");
    expect(source).toContain("approveMistakeCorrectionAction");
    expect(source).toContain('requirePermission("mistakes:viewOwn"');
    expect(source).toContain('requirePermission("mistakes:manage"');
    expect(source).toContain("prisma.$transaction");
    expect(source).toContain('status: "PENDING_CORRECTION"');
    expect(source).toContain('status: "CORRECTED"');
    expect(source).toContain('"MASTERED"');
    expect(source).toContain("student: {");
    expect(source).toContain("userId: currentUser.id");
    expect(source).toContain('currentUser.roleKey === "TEACHER"');
    expect(source).toContain("getTeacherErrorRecordScope");
    expect(source).toContain("writeAuditLog");
    expect(source).toContain("errorRecord.submitCorrection");
    expect(source).toContain("errorRecord.approveCorrection");
  });

  it("queries teacher-owned corrected mistakes for confirmation", () => {
    const querySource = readFileSync(join(process.cwd(), "features/mistakes/queries.ts"), "utf8");
    const scopePath = join(process.cwd(), "features/mistakes/scopes.ts");

    expect(existsSync(scopePath)).toBe(true);
    if (!existsSync(scopePath)) {
      return;
    }

    const scopeSource = readFileSync(scopePath, "utf8");

    expect(querySource).toContain("getTeacherMistakeCorrectionsForApproval");
    expect(querySource).toContain('status: "CORRECTED"');
    expect(querySource).toContain("getTeacherErrorRecordScope");
    expect(scopeSource).toContain("tenantId");
    expect(scopeSource).toContain("primaryTeacher");
    expect(scopeSource).toContain("homeworkSubmission");
    expect(scopeSource).toContain("teacherUserId");
  });

  it("renders student submit and teacher approval controls", () => {
    const studentPage = readFileSync(
      join(process.cwd(), "app/(mobile)/student/mistakes/page.tsx"),
      "utf8",
    );
    const teacherPage = readFileSync(
      join(process.cwd(), "app/(mobile)/teacher/homework/page.tsx"),
      "utf8",
    );
    const cardSource = readFileSync(
      join(process.cwd(), "features/mistakes/error-record-card.tsx"),
      "utf8",
    );
    const formPath = join(process.cwd(), "features/mistakes/mistake-correction-form.tsx");

    expect(existsSync(formPath)).toBe(true);
    if (!existsSync(formPath)) {
      return;
    }

    const formSource = readFileSync(formPath, "utf8");

    expect(studentPage).toContain("MistakeCorrectionActionForm");
    expect(studentPage).toContain('intent="submit"');
    expect(studentPage).toContain('item.status === "PENDING_CORRECTION"');
    expect(teacherPage).toContain("getTeacherMistakeCorrectionsForApproval");
    expect(teacherPage).toContain("待确认订正");
    expect(teacherPage).toContain('intent="approve"');
    expect(cardSource).toContain("action?: ReactNode");
    expect(formSource).toContain("submitMistakeCorrectionAction");
    expect(formSource).toContain("approveMistakeCorrectionAction");
    expect(formSource).toContain("提交订正");
    expect(formSource).toContain("确认掌握");
  });
});
