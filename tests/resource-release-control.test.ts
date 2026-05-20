import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("resource release control", () => {
  it("adds a tenant-indexed release time to resources", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toMatch(/model Resource[\s\S]*releaseAt\s+DateTime\?/);
    expect(schema).toContain("@@index([tenantId, releaseAt])");
  });

  it("parses release time in resource create and release update schemas", async () => {
    const modulePath = "../features/resources/resource-schema";
    const { resourceFormSchema, resourceReleaseSchema } = (await import(
      /* @vite-ignore */ modulePath
    )) as {
      resourceFormSchema: {
        safeParse: (input: unknown) => { success: boolean; data?: { releaseAt?: Date } };
      };
      resourceReleaseSchema: {
        safeParse: (input: unknown) => { success: boolean; data?: { releaseAt?: Date } };
      };
    };

    const createResult = resourceFormSchema.safeParse({
      title: "课前预习讲义",
      resourceType: "HANDOUT",
      lessonId: "cm00000000000000000000001",
      releaseAt: "2026-05-21T09:30",
    });
    const releaseResult = resourceReleaseSchema.safeParse({
      resourceId: "cm00000000000000000000002",
      releaseAt: "2026-05-21T18:00",
      returnTo: "/teacher/resources",
    });

    expect(createResult.success).toBe(true);
    expect(createResult.data?.releaseAt).toBeInstanceOf(Date);
    expect(releaseResult.success).toBe(true);
    expect(releaseResult.data?.releaseAt).toBeInstanceOf(Date);
  });

  it("hides unreleased resources from all student resource queries", () => {
    const source = readFileSync(join(process.cwd(), "features/resources/queries.ts"), "utf8");

    expect(source).toContain("const now = new Date()");
    expect(source).toContain("releaseAt");
    expect(source).toContain("lte: now");
    expect(source).toContain("getStudentVisibleResources");
    expect(source).toContain("getStudentLessonResources");
    expect(source).toContain("getStudentResourceDetail");
  });

  it("lets staff and assigned teachers update release time with audit logging", () => {
    const actionPath = join(process.cwd(), "features/resources/actions.ts");
    const dialogPath = join(process.cwd(), "features/resources/resource-release-dialog.tsx");

    expect(existsSync(dialogPath)).toBe(true);
    const actionSource = readFileSync(actionPath, "utf8");

    expect(actionSource).toContain("updateResourceReleaseAction");
    expect(actionSource).toContain("getResourceReleaseValues");
    expect(actionSource).toContain('requirePermission("resources:manage"');
    expect(actionSource).toContain("tx.resource.update");
    expect(actionSource).toContain("resource.release.update");
    expect(actionSource).toContain("primaryTeacher");
    expect(actionSource).toContain("teacher: {");
  });

  it("shows release controls in staff, teacher, and lesson resource UIs", () => {
    const createDialogSource = readFileSync(
      join(process.cwd(), "features/resources/resource-create-dialog.tsx"),
      "utf8",
    );
    const managementFiles = [
      "app/(dashboard)/dashboard/resources/page.tsx",
      "app/(mobile)/teacher/resources/page.tsx",
      "app/(mobile)/teacher/lessons/[lessonId]/page.tsx",
    ];

    expect(createDialogSource).toContain("releaseAt");
    for (const file of managementFiles) {
      const source = readFileSync(join(process.cwd(), file), "utf8");

      expect(source).toContain("releaseAt");
      expect(source).toContain("ResourceReleaseDialog");
    }
  });
});
