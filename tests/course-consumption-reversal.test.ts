import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("course consumption reversal", () => {
  it("tracks reversal metadata on CourseConsumption", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toMatch(/model CourseConsumption[\s\S]*reversedAt\s+DateTime\?/);
    expect(schema).toMatch(/model CourseConsumption[\s\S]*reversedByUserId\s+String\?/);
    expect(schema).toMatch(/model CourseConsumption[\s\S]*reversalReason\s+String\?/);
    expect(schema).toContain("@@index([tenantId, reversedAt])");
  });

  it("requires a reversal reason in the form schema", async () => {
    const schemaPath = join(process.cwd(), "features/course-consumptions/consumption-schema.ts");

    expect(existsSync(schemaPath)).toBe(true);
    if (!existsSync(schemaPath)) {
      return;
    }

    const modulePath = "../features/course-consumptions/consumption-schema";
    const { courseConsumptionReversalSchema } = (await import(/* @vite-ignore */ modulePath)) as {
      courseConsumptionReversalSchema: {
        safeParse: (input: unknown) => { success: boolean };
      };
    };

    expect(
      courseConsumptionReversalSchema.safeParse({
        courseConsumptionId: "cm00000000000000000000001",
        reason: "",
      }).success,
    ).toBe(false);
    expect(
      courseConsumptionReversalSchema.safeParse({
        courseConsumptionId: "cm00000000000000000000001",
        reason: "考勤误操作",
      }).success,
    ).toBe(true);
  });

  it("reverses consumption in a transaction, restores balance, and writes audit log", () => {
    const actionPath = join(process.cwd(), "features/course-consumptions/actions.ts");

    expect(existsSync(actionPath)).toBe(true);
    if (!existsSync(actionPath)) {
      return;
    }

    const source = readFileSync(actionPath, "utf8");

    expect(source).toContain('requirePermission("courseConsumption:mutate"');
    expect(source).toContain("getCourseConsumptionReversalFormValues");
    expect(source).toContain("prisma.$transaction");
    expect(source).toContain("tx.courseConsumption.findFirst");
    expect(source).toContain("reversedAt: null");
    expect(source).toContain("tx.courseAccount.updateMany");
    expect(source).toContain("tenantId: currentUser.tenantId");
    expect(source).toContain("accountRestoreResult.count");
    expect(source).toContain("Unable to restore tenant-scoped course account");
    expect(source).toContain("decrement: consumption.consumedHours");
    expect(source).toContain("tx.courseConsumption.updateMany");
    expect(source).toContain("reversalResult.count");
    expect(source).toContain("reversalReason");
    expect(source).toContain("writeAuditLog");
    expect(source).toContain("courseConsumption.reverse");
  });

  it("renders a staff-only reversal action with confirmation on the ledger page", () => {
    const staffPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/course-consumptions/page.tsx"),
      "utf8",
    );
    const formPath = join(process.cwd(), "features/course-consumptions/reversal-dialog.tsx");

    expect(existsSync(formPath)).toBe(true);
    if (!existsSync(formPath)) {
      return;
    }

    const formSource = readFileSync(formPath, "utf8");

    expect(staffPage).toContain("CourseConsumptionReversalDialog");
    expect(formSource).toContain("reverseCourseConsumptionAction");
    expect(formSource).toContain('name="reason"');
    expect(formSource).toContain("window.confirm");
  });
});
