import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { campusFormSchema, roomFormSchema } from "../features/campuses/campus-schema";
import { hasPermission } from "../lib/rbac/permissions";

describe("campus and room management", () => {
  it("extends campus and room models with operations fields", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("model Campus");
    expect(schema).toContain("businessHours");
    expect(schema).toContain("model Room");
    expect(schema).toContain("equipment");
    expect(schema).toContain("@@unique([tenantId, campusId, name])");
    expect(schema).toContain("@@index([tenantId, campusId])");
  });

  it("validates campus and room forms before mutations", () => {
    expect(() =>
      campusFormSchema.parse({
        name: "总部校区",
        address: "人民路 100 号",
        businessHours: "周一至周五 13:00-21:00",
        status: "ACTIVE",
      }),
    ).not.toThrow();

    expect(() =>
      roomFormSchema.parse({
        campusId: "clxcampus000000000000001",
        name: "A101",
        capacity: "24",
        equipment: "白板、投影",
        status: "ACTIVE",
      }),
    ).not.toThrow();

    expect(() =>
      campusFormSchema.parse({
        name: "",
        address: "",
        businessHours: "",
        status: "ACTIVE",
      }),
    ).toThrow();

    expect(() =>
      roomFormSchema.parse({
        campusId: "bad-id",
        name: "",
        capacity: "-1",
        equipment: "",
        status: "ACTIVE",
      }),
    ).toThrow();
  });

  it("keeps campus and room management staff-only", () => {
    expect(hasPermission("ORG_ADMIN", "campus:manage")).toBe(true);
    expect(hasPermission("CAMPUS_ADMIN", "campus:manage")).toBe(true);
    expect(hasPermission("STUDENT", "campus:manage")).toBe(false);
    expect(hasPermission("PARENT", "campus:manage")).toBe(false);
  });

  it("uses tenant-scoped campus actions with audit logging", () => {
    const source = readFileSync(join(process.cwd(), "features/campuses/actions.ts"), "utf8");

    expect(source).toContain('requirePermission("campus:manage"');
    expect(source).toContain("currentUser.tenantId");
    expect(source).toContain("$transaction");
    expect(source).toContain("writeAuditLog");
  });

  it("renders campus list, room management detail, and route states", () => {
    const listPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/campuses/page.tsx"),
      "utf8",
    );
    const detailPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/campuses/[campusId]/page.tsx"),
      "utf8",
    );
    const loadingPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/campuses/loading.tsx"),
      "utf8",
    );
    const errorPage = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/campuses/error.tsx"),
      "utf8",
    );

    expect(listPage).toContain("CampusCreateDialog");
    expect(listPage).toContain("EmptyState");
    expect(detailPage).toContain("RoomCreateDialog");
    expect(detailPage).toContain("RoomEditDialog");
    expect(loadingPage).toContain("LoadingState");
    expect(errorPage).toContain("ErrorState");
  });
});
