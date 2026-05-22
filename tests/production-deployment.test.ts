import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("production deployment and client installation readiness", () => {
  it("documents the unified client installation and security boundary", () => {
    for (const path of [
      "docs/CLIENT_INSTALLATION_STRATEGY.md",
      "docs/DESKTOP_CLIENT_RFC.md",
      "docs/ROLE_BASED_CLIENT_ACCESS.md",
      "docs/SECURITY_BOUNDARY_CLIENT_SERVER.md",
      "docs/FINAL_DEPLOY_TO_ECS_STEPS.md",
    ]) {
      expect(existsSync(join(rootDir, path))).toBe(true);
    }

    const strategy = readProjectFile("docs/CLIENT_INSTALLATION_STRATEGY.md");
    const boundary = readProjectFile("docs/SECURITY_BOUNDARY_CLIENT_SERVER.md");

    expect(strategy).toContain("one EduOS");
    expect(strategy).toContain("https://eduos.study-go.top");
    expect(strategy).toContain("PWA");
    expect(strategy).toContain("Tauri");
    expect(boundary).toContain("server-side RBAC");
    expect(boundary).toContain("tenantId");
    expect(boundary).toContain("client cannot connect directly to RDS");
    expect(boundary).toContain("client must not hold OSS AccessKey");
  });

  it("adds production deployment scripts with migration and secret safety gates", () => {
    for (const path of [
      "scripts/server/deploy-production.sh",
      "scripts/server/rollback.sh",
      "scripts/server/health-check.sh",
      "scripts/server/check-nginx.sh",
      "ecosystem.config.cjs",
    ]) {
      expect(existsSync(join(rootDir, path))).toBe(true);
    }

    const deployProduction = readProjectFile("scripts/server/deploy-production.sh");
    const rollback = readProjectFile("scripts/server/rollback.sh");
    const healthCheck = readProjectFile("scripts/server/health-check.sh");
    const nginxCheck = readProjectFile("scripts/server/check-nginx.sh");
    const nextConfig = readProjectFile("next.config.ts");

    expect(deployProduction).toContain("RUN_PRODUCTION_MIGRATIONS");
    expect(deployProduction).toContain("reject_unsafe_migrations");
    expect(deployProduction).toContain("DROP[[:space:]]+TABLE");
    expect(deployProduction).toContain("DELETE[[:space:]]+FROM");
    expect(deployProduction).toContain("pnpm build");
    expect(deployProduction).not.toContain("cat $ENV_FILE");
    expect(rollback).toContain("PM2");
    expect(healthCheck).toContain("eduos.study-go.top");
    expect(nginxCheck).toContain("nginx -t");
    expect(nextConfig).toContain('output: "standalone"');
  });

  it("records HTTPS, deployment history, human actions, and blockers", () => {
    for (const path of [
      "docs/DEPLOYMENT_RUNBOOK.md",
      "docs/ALIYUN_PRODUCTION_DEPLOYMENT.md",
      "docs/STAGING_TO_PRODUCTION_CHECKLIST.md",
      "docs/DEPLOYMENT_HISTORY.md",
      "docs/DEPLOYMENT_AND_UPDATE_SUMMARY.md",
    ]) {
      expect(existsSync(join(rootDir, path))).toBe(true);
    }

    const productionGuide = readProjectFile("docs/ALIYUN_PRODUCTION_DEPLOYMENT.md");
    const humanActions = readProjectFile("docs/HUMAN_ACTIONS.md");
    const blockers = readProjectFile("docs/BLOCKERS.md");

    expect(productionGuide).toContain("certbot");
    expect(productionGuide).toContain("https://eduos.study-go.top");
    expect(productionGuide).toContain("RUN_PRODUCTION_MIGRATIONS=true");
    expect(humanActions).toContain("HTTPS");
    expect(blockers).toContain("Production migration");
  });
});
