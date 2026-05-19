import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { createSessionToken, verifySessionToken } from "../lib/auth/session";
import { hashPassword, verifyPassword } from "../lib/auth/password";

describe("auth foundation", () => {
  it("hashes passwords without storing plaintext", async () => {
    const password = "EduOS-demo-password-123";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash).toContain("pbkdf2_sha256");
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("signs session tokens with role and tenant context", () => {
    const token = createSessionToken(
      {
        userId: "user_1",
        tenantId: "tenant_1",
        roleKey: "ORG_ADMIN",
        expiresAt: Date.now() + 60_000,
      },
      "test-secret",
    );

    const payload = verifySessionToken(token, "test-secret");

    expect(payload).toEqual({
      userId: "user_1",
      tenantId: "tenant_1",
      roleKey: "ORG_ADMIN",
      expiresAt: expect.any(Number),
    });
    expect(verifySessionToken(`${token}tampered`, "test-secret")).toBeNull();
  });

  it("adds a password hash field to users", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("passwordHash String");
    expect(schema).not.toContain("password String");
  });

  it("protects the dashboard layout on the server", () => {
    const dashboardLayout = readFileSync(join(process.cwd(), "app/(dashboard)/layout.tsx"), "utf8");

    expect(dashboardLayout).toContain("requireCurrentUser");
  });
});
