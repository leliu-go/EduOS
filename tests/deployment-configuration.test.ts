import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("deployment configuration", () => {
  it("documents local setup, production deployment, and required environment variables", () => {
    const deploymentPath = join(rootDir, "docs/DEPLOYMENT.md");

    expect(existsSync(deploymentPath)).toBe(true);

    const deployment = readProjectFile("docs/DEPLOYMENT.md");

    expect(deployment).toContain("Local setup");
    expect(deployment).toContain("Production deployment");
    expect(deployment).toContain("Environment variables");
    expect(deployment).toContain("pnpm install");
    expect(deployment).toContain("pnpm exec prisma db push");
    expect(deployment).toContain("pnpm prisma db seed");
    expect(deployment).toContain("pnpm build");
    expect(deployment).toContain("pnpm start");
    expect(deployment).toContain("DATABASE_URL");
    expect(deployment).toContain("AUTH_SECRET");
    expect(deployment).toContain("CHECK_IN_QR_SECRET");
    expect(deployment).toContain("NEXT_PUBLIC_APP_URL");
  });

  it("keeps env example aligned with runtime variables used by the app", () => {
    const envExample = readProjectFile(".env.example");

    for (const variableName of [
      "DATABASE_URL",
      "AUTH_SECRET",
      "CHECK_IN_QR_SECRET",
      "NEXT_PUBLIC_APP_URL",
      "EDUOS_DEMO_PASSWORD",
    ]) {
      expect(envExample).toContain(`${variableName}=`);
    }
  });

  it("defines scripts needed by deployment platforms", () => {
    const packageJson = JSON.parse(readProjectFile("package.json")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.build).toBe("prisma generate && next build");
    expect(packageJson.scripts?.start).toBe("next start");
    expect(packageJson.scripts?.prisma).toBeUndefined();
  });

  it("loads local environment variables before seeded Playwright flows run", () => {
    const playwrightConfig = readProjectFile("playwright.config.ts");

    expect(playwrightConfig).toContain('import "dotenv/config"');
  });

  it("allows seeded login redirects enough time for password verification", () => {
    const playwrightConfig = readProjectFile("playwright.config.ts");

    expect(playwrightConfig).toContain("expect:");
    expect(playwrightConfig).toContain("timeout: 15_000");
  });
});
