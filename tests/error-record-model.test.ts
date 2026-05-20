import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("error record model", () => {
  const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

  it("defines error record source, reason, and status enums", () => {
    expect(schema).toContain("enum ErrorRecordSourceType");
    expect(schema).toContain("HOMEWORK_SUBMISSION");
    expect(schema).toContain("ASSESSMENT_RESULT");
    expect(schema).toContain("MANUAL");
    expect(schema).toContain("enum ErrorReason");
    expect(schema).toContain("CONCEPT_UNCLEAR");
    expect(schema).toContain("CALCULATION_ERROR");
    expect(schema).toContain("CARELESS");
    expect(schema).toContain("enum ErrorRecordStatus");
    expect(schema).toContain("PENDING_CORRECTION");
    expect(schema).toContain("CORRECTED");
    expect(schema).toContain("MASTERED");
  });

  it("adds a tenant-scoped ErrorRecord model for one student", () => {
    expect(schema).toContain("model ErrorRecord");
    expect(schema).toMatch(/tenantId\s+String/);
    expect(schema).toMatch(/tenant\s+Tenant\s+@relation/);
    expect(schema).toMatch(/studentId\s+String/);
    expect(schema).toMatch(/student\s+StudentProfile\s+@relation/);
    expect(schema).toMatch(/status\s+ErrorRecordStatus\s+@default\(PENDING_CORRECTION\)/);
    expect(schema).toContain("@@index([tenantId, studentId])");
  });

  it("links an error record to an optional question and required knowledge point", () => {
    expect(schema).toMatch(/questionId\s+String\?/);
    expect(schema).toMatch(/question\s+Question\?\s+@relation/);
    expect(schema).toMatch(/knowledgePointId\s+String/);
    expect(schema).toMatch(/knowledgePoint\s+KnowledgePoint\s+@relation/);
    expect(schema).toMatch(/sourceType\s+ErrorRecordSourceType/);
    expect(schema).toMatch(/errorReason\s+ErrorReason/);
    expect(schema).toContain("@@index([tenantId, knowledgePointId])");
  });
});
