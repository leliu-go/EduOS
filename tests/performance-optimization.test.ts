import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("performance optimization", () => {
  it("paginates class group lists and keeps list query relations eager-loaded", () => {
    const querySource = readFileSync(join(process.cwd(), "features/classes/queries.ts"), "utf8");
    const pageSource = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/classes/page.tsx"),
      "utf8",
    );

    expect(querySource).toContain("classGroupPageSize");
    expect(querySource).toContain("normalizeClassGroupListQuery");
    expect(querySource).toContain("prisma.$transaction");
    expect(querySource).toContain("skip: (page - 1) * classGroupPageSize");
    expect(querySource).toContain("take: classGroupPageSize");
    expect(querySource).toContain("_count");
    expect(querySource).toContain("courseProduct: true");
    expect(querySource).toContain("primaryTeacher: true");
    expect(querySource).toContain("campus: true");

    expect(pageSource).toContain("normalizeClassGroupListQuery");
    expect(pageSource).toContain("pageCount");
    expect(pageSource).toContain("buildClassGroupsHref");
    expect(pageSource).toContain("上一页");
    expect(pageSource).toContain("下一页");
  });

  it("adds composite indexes for high-volume class and schedule access patterns", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("@@index([tenantId, status, startsAt, name])");
    expect(schema).toContain("@@index([tenantId, startAt])");
    expect(schema).toContain("@@index([tenantId, campusId, roomId])");
    expect(schema).toContain("@@index([tenantId, classGroupId])");
  });
});
