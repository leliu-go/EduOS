import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  gradeConfigSchema,
  subjectConfigSchema,
  termConfigSchema,
} from "../features/academic-config/config-schema";
import { hasPermission } from "../lib/rbac/permissions";

describe("academic configuration", () => {
  it("adds tenant-scoped Subject, Grade, and Term models", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("model Subject");
    expect(schema).toContain("model Grade");
    expect(schema).toContain("model Term");
    expect(schema).toContain("@@unique([tenantId, name])");
    expect(schema).toContain("@@index([tenantId, status])");
  });

  it("validates subject, grade, and term forms", () => {
    expect(() =>
      subjectConfigSchema.parse({
        name: "数学",
        code: "MATH",
        status: "ACTIVE",
      }),
    ).not.toThrow();
    expect(() =>
      gradeConfigSchema.parse({
        name: "初一",
        sortOrder: "10",
        status: "ACTIVE",
      }),
    ).not.toThrow();
    expect(() =>
      termConfigSchema.parse({
        name: "2026 春季",
        startsAt: "2026-02-01",
        endsAt: "2026-06-30",
        status: "ACTIVE",
      }),
    ).not.toThrow();

    expect(() => subjectConfigSchema.parse({ name: "", code: "", status: "ACTIVE" })).toThrow();
    expect(() =>
      gradeConfigSchema.parse({ name: "", sortOrder: "-1", status: "ACTIVE" }),
    ).toThrow();
    expect(() =>
      termConfigSchema.parse({
        name: "",
        startsAt: "2026-07-01",
        endsAt: "2026-06-30",
        status: "ACTIVE",
      }),
    ).toThrow();
  });

  it("keeps academic configuration staff-controlled", () => {
    expect(hasPermission("ORG_ADMIN", "academicConfig:manage")).toBe(true);
    expect(hasPermission("ACADEMIC", "academicConfig:manage")).toBe(true);
    expect(hasPermission("STUDENT", "academicConfig:manage")).toBe(false);
  });

  it("uses tenant-scoped actions with audit logging", () => {
    const source = readFileSync(join(process.cwd(), "features/academic-config/actions.ts"), "utf8");

    expect(source).toContain('requirePermission("academicConfig:manage"');
    expect(source).toContain("currentUser.tenantId");
    expect(source).toContain("$transaction");
    expect(source).toContain("writeAuditLog");
  });

  it("renders the academic configuration page and route states", () => {
    const page = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/academic-config/page.tsx"),
      "utf8",
    );
    const loadingPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/academic-config/loading.tsx"),
      "utf8",
    );
    const errorPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/academic-config/error.tsx"),
      "utf8",
    );

    expect(page).toContain("SubjectCreateDialog");
    expect(page).toContain("GradeCreateDialog");
    expect(page).toContain("TermCreateDialog");
    expect(loadingPage).toContain("LoadingState");
    expect(errorPage).toContain("ErrorState");
  });
});
