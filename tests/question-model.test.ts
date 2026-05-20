import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("question model", () => {
  const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

  it("defines question difficulty and type enums", () => {
    expect(schema).toContain("enum QuestionDifficulty");
    expect(schema).toContain("EASY");
    expect(schema).toContain("MEDIUM");
    expect(schema).toContain("HARD");
    expect(schema).toContain("enum QuestionType");
    expect(schema).toContain("SINGLE_CHOICE");
    expect(schema).toContain("MULTIPLE_CHOICE");
    expect(schema).toContain("SHORT_ANSWER");
  });

  it("adds a tenant-scoped Question model with content fields", () => {
    expect(schema).toContain("model Question");
    expect(schema).toMatch(/tenantId\s+String/);
    expect(schema).toMatch(/tenant\s+Tenant\s+@relation/);
    expect(schema).toMatch(/stem\s+String/);
    expect(schema).toMatch(/answer\s+String/);
    expect(schema).toMatch(/explanation\s+String\?/);
    expect(schema).toMatch(/difficulty\s+QuestionDifficulty/);
    expect(schema).toMatch(/questionType\s+QuestionType/);
    expect(schema).toMatch(/status\s+ConfigStatus\s+@default\(ACTIVE\)/);
  });

  it("links questions to knowledge points through a tenant-scoped join model", () => {
    expect(schema).toContain("model QuestionKnowledgePoint");
    expect(schema).toMatch(/knowledgePoints\s+QuestionKnowledgePoint\[\]/);
    expect(schema).toMatch(/questions\s+QuestionKnowledgePoint\[\]/);
    expect(schema).toMatch(/questionId\s+String/);
    expect(schema).toMatch(/question\s+Question\s+@relation/);
    expect(schema).toMatch(/knowledgePointId\s+String/);
    expect(schema).toMatch(/knowledgePoint\s+KnowledgePoint\s+@relation/);
    expect(schema).toContain("@@unique([tenantId, questionId, knowledgePointId])");
  });
});
