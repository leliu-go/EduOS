import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

function getModelBlock(modelName: string) {
  const match = schema.match(new RegExp(`model ${modelName} \\{[\\s\\S]*?\\n\\}`));
  return match?.[0] ?? "";
}

describe("multi-tenant foundation models", () => {
  it("defines the required T06 models", () => {
    for (const modelName of ["Tenant", "Campus", "Room", "User", "Role", "Membership"]) {
      expect(schema).toContain(`model ${modelName}`);
      expect(getModelBlock(modelName)).toMatch(/\bid\s+String\s+@id/);
      expect(getModelBlock(modelName)).toMatch(/\bcreatedAt\s+DateTime/);
      expect(getModelBlock(modelName)).toMatch(/\bupdatedAt\s+DateTime/);
    }
  });

  it("scopes tenant-owned data with tenantId", () => {
    for (const modelName of ["Campus", "Room", "Role", "Membership"]) {
      const model = getModelBlock(modelName);

      expect(model).toContain("tenantId");
      expect(model).toMatch(/\btenant\s+Tenant/);
      expect(model).toContain("@@index([tenantId])");
    }
  });

  it("allows users to join one or more tenants through memberships", () => {
    const user = getModelBlock("User");
    const membership = getModelBlock("Membership");

    expect(user).toContain("memberships Membership[]");
    expect(membership).toContain("userId");
    expect(membership).toMatch(/\buser\s+User/);
    expect(membership).toContain("roleId");
    expect(membership).toMatch(/\brole\s+Role/);
    expect(membership).toContain("@@index([tenantId, userId])");
  });

  it("links rooms to both campus and tenant", () => {
    const room = getModelBlock("Room");
    const campus = getModelBlock("Campus");
    const tenant = getModelBlock("Tenant");

    expect(room).toContain("campusId");
    expect(room).toMatch(/\bcampus\s+Campus/);
    expect(campus).toContain("rooms       Room[]");
    expect(tenant).toContain("rooms       Room[]");
    expect(room).toContain("@@unique([tenantId, campusId, name])");
  });

  it("defines the standard role keys without adding permissions yet", () => {
    for (const role of [
      "SUPER_ADMIN",
      "ORG_ADMIN",
      "CAMPUS_ADMIN",
      "ACADEMIC",
      "FINANCE",
      "TEACHER",
      "STUDENT",
      "PARENT",
    ]) {
      expect(schema).toContain(role);
    }

    expect(schema).not.toContain("permission");
  });
});
