import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type CompensationModule = {
  calculateTeacherCompensation: (
    rule: {
      calculationMode: "LESSON" | "HOUR" | "STUDENT_COUNT" | "CLASS_TYPE";
      rateAmount: number;
      classTypeRates?: Partial<Record<"OFFLINE" | "ONLINE" | "HYBRID", number>>;
    },
    context: {
      lessonCount: number;
      hours: number;
      studentCount: number;
      classType: "OFFLINE" | "ONLINE" | "HYBRID";
    },
  ) => number;
};

describe("teacher compensation rules", () => {
  it("defines tenant-scoped teacher compensation rules", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("enum TeacherCompensationCalculationMode");
    for (const mode of ["LESSON", "HOUR", "STUDENT_COUNT", "CLASS_TYPE"]) {
      expect(schema).toContain(mode);
    }
    expect(schema).toContain("enum TeacherCompensationRuleStatus");
    expect(schema).toContain("model TeacherCompensationRule");
    expect(schema).toMatch(/tenantId\s+String/);
    expect(schema).toMatch(/teacherId\s+String\?/);
    expect(schema).toMatch(/classType\s+ClassType\?/);
    expect(schema).toMatch(/calculationMode\s+TeacherCompensationCalculationMode/);
    expect(schema).toMatch(/rateAmount\s+Decimal/);
    expect(schema).toMatch(/classTypeRatesJson\s+Json\?/);
    expect(schema).toContain("@@index([tenantId, teacherId])");
    expect(schema).toContain("@@index([tenantId, calculationMode])");
  });

  it("calculates by lesson, hour, student count, and class type", async () => {
    const modulePath = join(process.cwd(), "features/teacher-compensation/calculate.ts");

    expect(existsSync(modulePath)).toBe(true);
    if (!existsSync(modulePath)) {
      return;
    }

    const { calculateTeacherCompensation } =
      (await import("../features/teacher-compensation/calculate")) as CompensationModule;
    const context = {
      lessonCount: 2,
      hours: 3,
      studentCount: 8,
      classType: "OFFLINE" as const,
    };

    expect(
      calculateTeacherCompensation({ calculationMode: "LESSON", rateAmount: 120 }, context),
    ).toBe(240);
    expect(calculateTeacherCompensation({ calculationMode: "HOUR", rateAmount: 90 }, context)).toBe(
      270,
    );
    expect(
      calculateTeacherCompensation({ calculationMode: "STUDENT_COUNT", rateAmount: 15 }, context),
    ).toBe(120);
    expect(
      calculateTeacherCompensation(
        {
          calculationMode: "CLASS_TYPE",
          rateAmount: 100,
          classTypeRates: {
            OFFLINE: 220,
            ONLINE: 180,
          },
        },
        context,
      ),
    ).toBe(220);
  });
});
