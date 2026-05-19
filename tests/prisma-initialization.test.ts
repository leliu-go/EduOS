import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("Prisma initialization", () => {
  it("configures a PostgreSQL datasource without a hard-coded database URL", () => {
    const schema = readProjectFile("prisma/schema.prisma");
    const prismaConfig = readProjectFile("prisma.config.ts");

    expect(schema).toContain('provider = "postgresql"');
    expect(schema).not.toContain("url");
    expect(prismaConfig).toContain("datasource");
    expect(prismaConfig).toContain("process.env.DATABASE_URL");
    expect(schema).not.toContain("postgresql://");
    expect(schema).not.toContain("postgres://");
    expect(prismaConfig).not.toContain("postgresql://");
    expect(prismaConfig).not.toContain("postgres://");
  });

  it("defines Prisma Client generation and a reusable client helper", () => {
    const schema = readProjectFile("prisma/schema.prisma");
    const clientHelper = readProjectFile("lib/prisma.ts");
    const packageJson = JSON.parse(readProjectFile("package.json")) as {
      scripts?: Record<string, string>;
    };

    expect(schema).toContain("generator client");
    expect(schema).toContain('provider = "prisma-client"');
    expect(schema).toContain('output   = "../lib/generated/prisma"');
    expect(clientHelper).toContain("PrismaPg");
    expect(clientHelper).toContain("PrismaClient");
    expect(clientHelper).toContain("@/lib/generated/prisma/client");
    expect(clientHelper).toContain("export const prisma");
    expect(packageJson.scripts?.typecheck).toContain("prisma generate");
  });

  it("documents the required database URL and seed placeholder", () => {
    const envExample = readProjectFile(".env.example");
    const packageJson = JSON.parse(readProjectFile("package.json")) as {
      prisma?: { seed?: string };
    };

    expect(envExample).toContain("DATABASE_URL=");
    expect(envExample).toContain("postgresql://");
    expect(existsSync(join(rootDir, "prisma/seed.ts"))).toBe(true);
    expect(existsSync(join(rootDir, "prisma.config.ts"))).toBe(true);
    expect(packageJson.prisma?.seed).toBe("tsx prisma/seed.ts");
  });
});
