import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("resource storage metadata", () => {
  it("keeps provider object metadata tenant-scoped on Resource", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toMatch(/enum ResourceVisibility[\s\S]*PRIVATE/);
    expect(schema).toMatch(/model Resource[\s\S]*provider\s+String\?/);
    expect(schema).toMatch(/model Resource[\s\S]*bucket\s+String\?/);
    expect(schema).toMatch(/model Resource[\s\S]*objectKey\s+String\?/);
    expect(schema).toMatch(/model Resource[\s\S]*originalName\s+String\?/);
    expect(schema).toMatch(/model Resource[\s\S]*mimeType\s+String\?/);
    expect(schema).toMatch(/model Resource[\s\S]*size\s+Int\?/);
    expect(schema).toMatch(/model Resource[\s\S]*checksum\s+String\?/);
    expect(schema).toMatch(/model Resource[\s\S]*visibility\s+ResourceVisibility/);
    expect(schema).toMatch(/model Resource[\s\S]*createdById\s+String\?/);
    expect(schema).toContain("@@index([tenantId, provider])");
    expect(schema).toContain("@@index([tenantId, objectKey])");
    expect(schema).toContain("@@index([tenantId, visibility])");
  });

  it("does not allow local resource payloads or production env files into git artifacts", () => {
    const gitignore = readFileSync(join(process.cwd(), ".gitignore"), "utf8");
    const dockerignore = readFileSync(join(process.cwd(), ".dockerignore"), "utf8");
    const envExample = readFileSync(join(process.cwd(), ".env.production.example"), "utf8");

    for (const ignored of [".env*.local", ".local", "/storage", "/resources"]) {
      expect(gitignore).toContain(ignored);
    }
    for (const ignored of ["node_modules", ".next/cache", "public/uploads", "resources"]) {
      expect(dockerignore).toContain(ignored);
    }
    expect(envExample).toContain("ALIYUN_OSS_ACCESS_KEY_ID=");
    expect(envExample).toContain("ALIYUN_OSS_ACCESS_KEY_SECRET=");
    expect(envExample).not.toContain("test-access-key-secret");
  });
});
