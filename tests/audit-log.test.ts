import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { redactAuditJson, writeAuditLog, type AuditLogClient } from "../lib/audit/audit-log";

describe("audit log foundation", () => {
  it("defines the AuditLog model with required fields and tenant indexes", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("model AuditLog");
    expect(schema).toContain("tenantId");
    expect(schema).toContain("actorUserId");
    expect(schema).toContain("action");
    expect(schema).toContain("entityType");
    expect(schema).toContain("entityId");
    expect(schema).toContain("beforeJson");
    expect(schema).toContain("afterJson");
    expect(schema).toContain("reason");
    expect(schema).toContain("@@index([tenantId, createdAt])");
  });

  it("redacts sensitive values before they can be logged", () => {
    const redacted = redactAuditJson({
      name: "张三",
      password: "plain-password",
      nested: {
        accessToken: "secret-token",
        authSecret: "secret-value",
        safe: "kept",
      },
    });

    expect(redacted).toEqual({
      name: "张三",
      password: "[REDACTED]",
      nested: {
        accessToken: "[REDACTED]",
        authSecret: "[REDACTED]",
        safe: "kept",
      },
    });
  });

  it("writes a tenant-scoped audit log through an injectable client", async () => {
    const createdData: unknown[] = [];
    const client = {
      auditLog: {
        async create(args) {
          createdData.push(args.data);
          return args.data;
        },
      },
    } satisfies AuditLogClient;

    await writeAuditLog(
      {
        tenantId: "tenant_1",
        actorUserId: "user_1",
        action: "student.update",
        entityType: "student",
        entityId: "student_1",
        beforeJson: { name: "旧姓名", passwordHash: "stored-hash" },
        afterJson: { name: "新姓名" },
        reason: "修正学生姓名",
      },
      client,
    );

    expect(createdData).toEqual([
      {
        tenantId: "tenant_1",
        actorUserId: "user_1",
        action: "student.update",
        entityType: "student",
        entityId: "student_1",
        beforeJson: { name: "旧姓名", passwordHash: "[REDACTED]" },
        afterJson: { name: "新姓名" },
        reason: "修正学生姓名",
      },
    ]);
  });
});
