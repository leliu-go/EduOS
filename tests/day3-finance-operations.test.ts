import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("Day 3 finance operations", () => {
  it("documents manual finance operations without real payment integration", () => {
    for (const path of [
      "docs/FINANCE_OPERATIONS_SPEC.md",
      "docs/FINANCE_WORKFLOW.md",
      "docs/FINANCE_PERMISSIONS.md",
    ]) {
      expect(existsSync(join(rootDir, path))).toBe(true);
    }

    const spec = readProjectFile("docs/FINANCE_OPERATIONS_SPEC.md");
    const workflow = readProjectFile("docs/FINANCE_WORKFLOW.md");
    const permissions = readProjectFile("docs/FINANCE_PERMISSIONS.md");

    expect(spec).toContain("人工录入收款");
    expect(spec).toContain("PaymentProvider");
    expect(spec).toContain("不接真实支付接口");
    expect(spec).toContain("收款 Payment 是现金流入，不等于已确认收入");
    expect(workflow).toContain("课消冲正");
    expect(workflow).toContain("退款申请");
    expect(permissions).toContain("finance:mutate");
    expect(permissions).toContain("学生、家长、老师不能进入财务后台");
  });

  it("adds a manual payment provider abstraction and guarded payment action", () => {
    const providerPath = "features/finance/payment-provider.ts";
    const actionPath = "features/payments/actions.ts";

    expect(existsSync(join(rootDir, providerPath))).toBe(true);
    expect(existsSync(join(rootDir, actionPath))).toBe(true);

    const providerSource = readProjectFile(providerPath);
    const actionSource = readProjectFile(actionPath);

    expect(providerSource).toContain("PaymentProvider");
    expect(providerSource).toContain("ManualPaymentProvider");
    expect(providerSource).not.toContain("fetch(");
    expect(providerSource).not.toContain("AccessKey");
    expect(actionSource).toContain('requirePermission("finance:mutate"');
    expect(actionSource).toContain("tenantId: currentUser.tenantId");
    expect(actionSource).toContain("writeAuditLog");
    expect(actionSource).toContain("payment.manual.create");
    expect(actionSource).toContain("getManualPaymentFormValues");
  });

  it("turns payment ledger into an operational finance page", () => {
    const pageSource = readProjectFile("app/(dashboard)/dashboard/payments/page.tsx");
    const listSource = readProjectFile("features/payments/payment-list.tsx");

    expect(pageSource).toContain("新增收款");
    expect(pageSource).toContain("新建订单");
    expect(pageSource).toContain("退款申请");
    expect(pageSource).toContain("查看审计日志");
    expect(pageSource).toContain("PaymentCreateDialog");
    expect(listSource).toContain("录入第一笔收款");
    expect(listSource).toContain("现金流入");
    expect(listSource).toContain("已确认");
  });
});
