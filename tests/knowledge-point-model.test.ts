import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("knowledge point model", () => {
  const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

  it("adds a tenant-scoped KnowledgePoint model", () => {
    expect(schema).toContain("model KnowledgePoint");
    expect(schema).toMatch(/tenantId\s+String/);
    expect(schema).toMatch(/tenant\s+Tenant\s+@relation/);
    expect(schema).toMatch(/status\s+ConfigStatus\s+@default\(ACTIVE\)/);
    expect(schema).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/);
    expect(schema).toMatch(/updatedAt\s+DateTime\s+@updatedAt/);
  });

  it("binds knowledge points to subject, grade, and chapter", () => {
    expect(schema).toMatch(/subjectId\s+String/);
    expect(schema).toMatch(/subject\s+Subject\s+@relation/);
    expect(schema).toMatch(/gradeId\s+String/);
    expect(schema).toMatch(/grade\s+Grade\s+@relation/);
    expect(schema).toMatch(/chapter\s+String/);
  });

  it("supports a parent-child hierarchy", () => {
    expect(schema).toMatch(/parentId\s+String\?/);
    expect(schema).toMatch(/parent\s+KnowledgePoint\?\s+@relation\("KnowledgePointHierarchy"/);
    expect(schema).toMatch(
      /children\s+KnowledgePoint\[\]\s+@relation\("KnowledgePointHierarchy"\)/,
    );
    expect(schema).toContain("@@index([tenantId, parentId])");
  });
});
