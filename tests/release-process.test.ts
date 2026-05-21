import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("release process documentation and scripts", () => {
  it("documents release, update manifest, and rollback without production publishing", () => {
    const releaseProcess = readFileSync("docs/RELEASE_PROCESS.md", "utf8");
    const updateManifest = readFileSync("docs/UPDATE_MANIFEST_SPEC.md", "utf8");
    const rollbackPlan = readFileSync("docs/ROLLBACK_PLAN.md", "utf8");
    const checkRelease = readFileSync("scripts/check-release.ps1", "utf8");
    const combined = `${releaseProcess}\n${updateManifest}\n${rollbackPlan}\n${checkRelease}`;

    expect(combined).toContain("No deploy");
    expect(combined).toContain("No code signing");
    expect(combined).toContain("No production database migration");
    expect(combined).toContain("/api/update-manifest");
    expect(combined).toContain("minimumSupportedVersion");
    expect(combined).toContain("RUN_PRODUCTION_MIGRATIONS");
    expect(combined).toContain(".env.production.local");
    expect(combined).toContain("CACHEABLE_STATIC_PREFIXES");
    expect(combined).toContain("Rollback");
    expect(rollbackPlan).toContain("PM2");
    expect(rollbackPlan).toContain("OSS files are not automatically deleted");
    expect(checkRelease).toContain("RunQualityGates");
    expect(checkRelease).toContain("Assert-NoDestructiveMigrationSql");
    expect(checkRelease).toContain("Assert-GitFileNotTracked");
  });

  it("runs the local static release check without deploying", () => {
    const output = execFileSync(
      "powershell",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "scripts/check-release.ps1"],
      {
        encoding: "utf8",
      },
    );

    expect(output).toContain("EduOS release static check passed");
    expect(output).toContain("No deploy/sign/publish action was performed");
  });
});
