import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("refund workflow", () => {
  it("defines tenant-scoped refunds linked to course accounts", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("enum RefundStatus");
    for (const status of ["PENDING_APPROVAL", "APPROVED", "REJECTED", "CANCELLED"]) {
      expect(schema).toContain(status);
    }

    expect(schema).toContain("model Refund");
    expect(schema).toMatch(/courseAccountId\s+String/);
    expect(schema).toMatch(/studentId\s+String/);
    expect(schema).toMatch(/amount\s+Decimal/);
    expect(schema).toMatch(/refundHours\s+Int/);
    expect(schema).toMatch(/reason\s+String/);
    expect(schema).toMatch(/approvalNote\s+String\?/);
    expect(schema).toMatch(/approvedByUserId\s+String\?/);
    expect(schema).toMatch(/approvedAt\s+DateTime\?/);
    expect(schema).toMatch(/status\s+RefundStatus\s+@default\(PENDING_APPROVAL\)/);
    expect(schema).toContain("@@index([tenantId, courseAccountId])");
    expect(schema).toContain("@@index([tenantId, status])");
  });

  it("requires reason and approval before affecting course accounts", () => {
    const schemaPath = join(process.cwd(), "features/refunds/refund-schema.ts");
    const actionPath = join(process.cwd(), "features/refunds/actions.ts");

    expect(existsSync(schemaPath)).toBe(true);
    expect(existsSync(actionPath)).toBe(true);
    if (!existsSync(schemaPath) || !existsSync(actionPath)) {
      return;
    }

    const schemaSource = readFileSync(schemaPath, "utf8");
    const actionSource = readFileSync(actionPath, "utf8");

    expect(schemaSource).toContain("refundRequestSchema");
    expect(schemaSource).toContain("refundApprovalSchema");
    expect(schemaSource).toContain("reason");
    expect(schemaSource).toContain("approvalNote");
    expect(schemaSource).toContain(".min(");

    expect(actionSource).toContain("createRefundRequestAction");
    expect(actionSource).toContain("approveRefundAction");
    expect(actionSource).toContain('requirePermission("finance:mutate"');
    expect(actionSource).toContain("prisma.$transaction");
    expect(actionSource).toContain("tx.refund.create");
    expect(actionSource).toContain('status: "PENDING_APPROVAL"');
    expect(actionSource).toContain("tx.refund.update");
    expect(actionSource).toContain("approvedByUserId");
    expect(actionSource).toContain("approvedAt");
    expect(actionSource).toContain("tx.courseAccount.updateMany");
    expect(actionSource).toContain("decrement");
    expect(actionSource).toContain("writeAuditLog");
    expect(actionSource).toContain("refund.approve");
    expect(actionSource).toContain("courseAccount.refund");
  });
});
