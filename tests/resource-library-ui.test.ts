import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("resource library UI", () => {
  it("validates resource metadata with type and at least one binding", async () => {
    const schemaPath = join(process.cwd(), "features/resources/resource-schema.ts");

    expect(existsSync(schemaPath)).toBe(true);
    if (!existsSync(schemaPath)) {
      return;
    }

    const modulePath = "../features/resources/resource-schema";
    const { resourceFormSchema } = (await import(/* @vite-ignore */ modulePath)) as {
      resourceFormSchema: {
        safeParse: (input: unknown) => { success: boolean };
      };
    };

    expect(
      resourceFormSchema.safeParse({
        title: "课堂讲义",
        resourceType: "HANDOUT",
        fileName: "lesson.pdf",
      }).success,
    ).toBe(false);
    expect(
      resourceFormSchema.safeParse({
        title: "课堂讲义",
        resourceType: "HANDOUT",
        fileName: "lesson.pdf",
        courseProductId: "cm00000000000000000000001",
      }).success,
    ).toBe(true);
  });

  it("queries resources with tenant scope, search, subject, grade, and type filters", () => {
    const queryPath = join(process.cwd(), "features/resources/queries.ts");

    expect(existsSync(queryPath)).toBe(true);
    if (!existsSync(queryPath)) {
      return;
    }

    const source = readFileSync(queryPath, "utf8");

    expect(source).toContain("getResourceLibrary");
    expect(source).toContain("getTeacherResourceLibrary");
    expect(source).toContain("getResourceLibraryOptions");
    expect(source).toContain("tenantId");
    expect(source).toContain("prisma.resource.count");
    expect(source).toContain("resourceType");
    expect(source).toContain("subjectId");
    expect(source).toContain("gradeId");
    expect(source).toContain("contains: query");
    expect(source).toContain("primaryTeacher");
  });

  it("orders resource option subjects by existing schema fields", () => {
    const queryPath = join(process.cwd(), "features/resources/queries.ts");
    const source = readFileSync(queryPath, "utf8");
    const start = source.indexOf("export async function getResourceLibraryOptions");
    const optionsSource = source.slice(start);
    const subjectQueryStart = optionsSource.indexOf("prisma.subject.findMany");
    const gradeQueryStart = optionsSource.indexOf("prisma.grade.findMany");
    const subjectQuery = optionsSource.slice(subjectQueryStart, gradeQueryStart);

    expect(subjectQuery).toContain('orderBy: [{ name: "asc" }]');
    expect(subjectQuery).not.toContain("sortOrder");
  });

  it("creates resource metadata through server validation and audit logging", () => {
    const actionPath = join(process.cwd(), "features/resources/actions.ts");

    expect(existsSync(actionPath)).toBe(true);
    if (!existsSync(actionPath)) {
      return;
    }

    const source = readFileSync(actionPath, "utf8");

    expect(source).toContain('requirePermission("resources:manage"');
    expect(source).toContain("getResourceFormValues");
    expect(source).toContain("currentUser.tenantId");
    expect(source).toContain("tx.resource.create");
    expect(source).toContain("canUseResourceBinding");
    expect(source).toContain("writeAuditLog");
    expect(source).toContain("resource.create");
  });

  it("renders staff and teacher resource library pages with filters and states", () => {
    const staffPagePath = join(process.cwd(), "app/(dashboard)/dashboard/resources/page.tsx");
    const teacherPagePath = join(process.cwd(), "app/(mobile)/teacher/resources/page.tsx");

    expect(existsSync(staffPagePath)).toBe(true);
    expect(existsSync(teacherPagePath)).toBe(true);
    if (!existsSync(staffPagePath) || !existsSync(teacherPagePath)) {
      return;
    }

    const staffPage = readFileSync(staffPagePath, "utf8");
    const teacherPage = readFileSync(teacherPagePath, "utf8");

    expect(staffPage).toContain('requirePermission("resources:manage"');
    expect(staffPage).toContain("ResourceCreateDialog");
    expect(staffPage).toContain('name="q"');
    expect(staffPage).toContain('name="subjectId"');
    expect(staffPage).toContain('name="gradeId"');
    expect(staffPage).toContain('name="resourceType"');
    expect(staffPage).toContain("DataTable");
    expect(teacherPage).toContain('requirePermission("resources:manage"');
    expect(teacherPage).toContain("getTeacherResourceLibrary");
    expect(teacherPage).toContain("ResourceCreateDialog");
  });

  it("adds loading, empty, error, and protected-route coverage", () => {
    const files = [
      "app/(dashboard)/dashboard/resources/loading.tsx",
      "app/(dashboard)/dashboard/resources/error.tsx",
      "app/(mobile)/teacher/resources/loading.tsx",
      "app/(mobile)/teacher/resources/error.tsx",
    ];

    for (const file of files) {
      expect(existsSync(join(process.cwd(), file))).toBe(true);
    }

    expect(
      readFileSync(join(process.cwd(), "app/(dashboard)/dashboard/resources/loading.tsx"), "utf8"),
    ).toContain("LoadingState");
    expect(
      readFileSync(join(process.cwd(), "app/(dashboard)/dashboard/resources/error.tsx"), "utf8"),
    ).toContain("ErrorState");
    expect(readFileSync(join(process.cwd(), "tests/e2e/auth.spec.ts"), "utf8")).toContain(
      "/dashboard/resources",
    );
    expect(readFileSync(join(process.cwd(), "tests/e2e/auth.spec.ts"), "utf8")).toContain(
      "/teacher/resources",
    );
  });
});
