import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("order model", () => {
  it("defines tenant-scoped order records for enrollment finance", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("enum OrderStatus");
    for (const status of ["PENDING_PAYMENT", "PAID", "CANCELLED", "REFUNDED"]) {
      expect(schema).toContain(status);
    }

    expect(schema).toContain("model Order");
    expect(schema).toMatch(/orderNo\s+String/);
    expect(schema).toMatch(/studentId\s+String/);
    expect(schema).toMatch(/guardianId\s+String\?/);
    expect(schema).toMatch(/courseProductId\s+String\?/);
    expect(schema).toMatch(/totalAmount\s+Decimal/);
    expect(schema).toMatch(/payableAmount\s+Decimal/);
    expect(schema).toMatch(/currency\s+String\s+@default\("CNY"\)/);
    expect(schema).toMatch(/status\s+OrderStatus\s+@default\(PENDING_PAYMENT\)/);
    expect(schema).toContain("@@unique([tenantId, orderNo])");
    expect(schema).toContain("@@index([tenantId, status])");
    expect(schema).toContain("@@index([tenantId, studentId])");
  });

  it("links enrollments to orders where applicable", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("orders      Order[]");
    expect(schema).toMatch(/orderId\s+String\?/);
    expect(schema).toContain("order           Order?");
    expect(schema).toContain("@@index([tenantId, orderId])");
  });
});
