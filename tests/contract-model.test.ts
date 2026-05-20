import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("contract model", () => {
  it("defines tenant-scoped contract templates and signing status foundation", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("enum ContractTemplateStatus");
    expect(schema).toContain("enum ContractStatus");
    for (const status of ["PENDING_SIGNATURE", "SIGNED", "CANCELLED", "EXPIRED"]) {
      expect(schema).toContain(status);
    }

    expect(schema).toContain("model ContractTemplate");
    expect(schema).toMatch(/tenantId\s+String/);
    expect(schema).toMatch(/name\s+String/);
    expect(schema).toMatch(/version\s+String/);
    expect(schema).toMatch(/contentJson\s+Json/);
    expect(schema).toMatch(/status\s+ContractTemplateStatus\s+@default\(ACTIVE\)/);
    expect(schema).toContain("@@unique([tenantId, name, version])");

    expect(schema).toContain("model Contract");
    expect(schema).toMatch(/templateId\s+String/);
    expect(schema).toMatch(/enrollmentId\s+String\?/);
    expect(schema).toMatch(/studentId\s+String/);
    expect(schema).toMatch(/guardianId\s+String\?/);
    expect(schema).toMatch(/status\s+ContractStatus\s+@default\(PENDING_SIGNATURE\)/);
    expect(schema).toContain("@@index([tenantId, enrollmentId])");
    expect(schema).toContain("@@index([tenantId, status])");
  });

  it("allows enrollment to require a contract template", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toMatch(/contractRequired\s+Boolean\s+@default\(false\)/);
    expect(schema).toMatch(/contractTemplateId\s+String\?/);
    expect(schema).toContain("contractTemplate ContractTemplate?");
    expect(schema).toMatch(/contracts\s+Contract\[\]/);
    expect(schema).toContain("@@index([tenantId, contractTemplateId])");
  });
});
