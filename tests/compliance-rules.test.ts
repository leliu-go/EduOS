import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type ComplianceModule = {
  evaluateComplianceRules: (
    rules: Array<{
      id: string;
      ruleType:
        | "FORBIDDEN_SCHEDULING_WINDOW"
        | "MAX_PREPAID_HOURS"
        | "CONTRACT_REQUIRED"
        | "TEACHER_QUALIFICATION_REQUIRED";
      severity: "WARN" | "BLOCK";
      configJson: unknown;
    }>,
    context: {
      scheduleStartAt?: Date;
      scheduleEndAt?: Date;
      prepaidHours?: number;
      contractRequired?: boolean;
      hasSignedContract?: boolean;
      teacherQualificationFileName?: string | null;
    },
  ) => Array<{ ruleId: string; severity: "WARN" | "BLOCK"; message: string }>;
};

describe("compliance rules", () => {
  it("defines configurable tenant-scoped compliance rules", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("enum ComplianceRuleType");
    for (const type of [
      "FORBIDDEN_SCHEDULING_WINDOW",
      "MAX_PREPAID_HOURS",
      "CONTRACT_REQUIRED",
      "TEACHER_QUALIFICATION_REQUIRED",
    ]) {
      expect(schema).toContain(type);
    }
    expect(schema).toContain("enum ComplianceRuleSeverity");
    expect(schema).toContain("WARN");
    expect(schema).toContain("BLOCK");
    expect(schema).toContain("model ComplianceRule");
    expect(schema).toMatch(/tenantId\s+String/);
    expect(schema).toMatch(/ruleType\s+ComplianceRuleType/);
    expect(schema).toMatch(/severity\s+ComplianceRuleSeverity/);
    expect(schema).toMatch(/configJson\s+Json/);
    expect(schema).toMatch(/status\s+ConfigStatus\s+@default\(ACTIVE\)/);
    expect(schema).toContain("@@index([tenantId, ruleType])");
    expect(schema).toContain("@@index([tenantId, severity])");
  });

  it("returns warn or block findings for configured rule types", async () => {
    const modulePath = join(process.cwd(), "features/compliance/evaluate.ts");

    expect(existsSync(modulePath)).toBe(true);
    if (!existsSync(modulePath)) {
      return;
    }

    const moduleSpecifier = "../features/compliance/evaluate";
    const { evaluateComplianceRules } = (await import(moduleSpecifier)) as ComplianceModule;
    const findings = evaluateComplianceRules(
      [
        {
          id: "window",
          ruleType: "FORBIDDEN_SCHEDULING_WINDOW",
          severity: "BLOCK",
          configJson: { windows: [{ start: "22:00", end: "07:00" }] },
        },
        {
          id: "hours",
          ruleType: "MAX_PREPAID_HOURS",
          severity: "WARN",
          configJson: { maxHours: 80 },
        },
        {
          id: "contract",
          ruleType: "CONTRACT_REQUIRED",
          severity: "BLOCK",
          configJson: {},
        },
        {
          id: "qualification",
          ruleType: "TEACHER_QUALIFICATION_REQUIRED",
          severity: "WARN",
          configJson: {},
        },
      ],
      {
        scheduleStartAt: new Date("2026-05-20T23:00:00+08:00"),
        scheduleEndAt: new Date("2026-05-20T23:45:00+08:00"),
        prepaidHours: 100,
        contractRequired: true,
        hasSignedContract: false,
        teacherQualificationFileName: null,
      },
    );

    expect(findings).toEqual([
      expect.objectContaining({ ruleId: "window", severity: "BLOCK" }),
      expect.objectContaining({ ruleId: "hours", severity: "WARN" }),
      expect.objectContaining({ ruleId: "contract", severity: "BLOCK" }),
      expect.objectContaining({ ruleId: "qualification", severity: "WARN" }),
    ]);
  });
});
