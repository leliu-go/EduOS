import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { getScheduleCreateFormValues } from "../features/scheduling/schedule-schema";
import { hasPermission } from "../lib/rbac/permissions";

describe("single scheduling flow", () => {
  it("validates manual schedule form values", () => {
    const formData = new FormData();
    formData.set("classGroupId", "cm00000000000000000000001");
    formData.set("teacherId", "cm00000000000000000000002");
    formData.set("roomId", "cm00000000000000000000003");
    formData.set("lessonTitle", "函数专题讲解");
    formData.set("startAt", "2026-09-02T10:00");
    formData.set("endAt", "2026-09-02T12:00");

    const parsed = getScheduleCreateFormValues(formData);

    expect(parsed.success).toBe(true);
    expect(parsed.success ? parsed.data.lessonTitle : "").toBe("函数专题讲解");
    expect(parsed.success ? parsed.data.startAt : null).toBeInstanceOf(Date);

    const invalidFormData = new FormData();
    invalidFormData.set("classGroupId", "cm00000000000000000000001");
    invalidFormData.set("teacherId", "cm00000000000000000000002");
    invalidFormData.set("roomId", "cm00000000000000000000003");
    invalidFormData.set("lessonTitle", "函数专题讲解");
    invalidFormData.set("startAt", "2026-09-02T10:00");
    invalidFormData.set("endAt", "2026-09-02T09:00");

    expect(getScheduleCreateFormValues(invalidFormData).success).toBe(false);
  });

  it("keeps schedule creation staff-only", () => {
    expect(hasPermission("ORG_ADMIN", "scheduling:mutate")).toBe(true);
    expect(hasPermission("CAMPUS_ADMIN", "scheduling:mutate")).toBe(true);
    expect(hasPermission("ACADEMIC", "scheduling:mutate")).toBe(true);
    expect(hasPermission("FINANCE", "scheduling:mutate")).toBe(false);
    expect(hasPermission("TEACHER", "scheduling:mutate")).toBe(false);
    expect(hasPermission("STUDENT", "scheduling:mutate")).toBe(false);
  });

  it("creates a tenant-scoped single schedule with lesson and audit log", () => {
    const actions = readFileSync(join(process.cwd(), "features/scheduling/actions.ts"), "utf8");

    expect(actions).toContain('requirePermission("scheduling:mutate"');
    expect(actions).toContain("getScheduleCreateFormValues");
    expect(actions).toContain("currentUser.tenantId");
    expect(actions).toContain("prisma.$transaction");
    expect(actions).toContain("tx.classGroup.findFirst");
    expect(actions).toContain("tx.teacherProfile.findFirst");
    expect(actions).toContain("tx.room.findFirst");
    expect(actions).toContain("tx.lesson.create");
    expect(actions).toContain("tx.schedule.create");
    expect(actions).toContain('status: "SCHEDULED"');
    expect(actions).toContain("writeAuditLog");
    expect(actions).toContain('action: "schedule.create"');
  });

  it("renders manual scheduling entry on the calendar page", () => {
    const page = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/scheduling/page.tsx"),
      "utf8",
    );
    const dialog = readFileSync(
      join(process.cwd(), "features/scheduling/schedule-create-dialog.tsx"),
      "utf8",
    );

    expect(page).toContain("ScheduleCreateDialog");
    expect(page).toContain("errorMessages");
    expect(dialog).toContain("createScheduleAction");
    expect(dialog).toContain('name="classGroupId"');
    expect(dialog).toContain('name="teacherId"');
    expect(dialog).toContain('name="roomId"');
    expect(dialog).toContain('name="startAt"');
    expect(dialog).toContain('name="endAt"');
  });
});
