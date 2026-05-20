import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("release artifact rules", () => {
  it("documents the measured local size drivers and installer exclusions", () => {
    expect(existsSync(join(rootDir, "docs/SIZE_AUDIT.md"))).toBe(true);
    expect(existsSync(join(rootDir, "docs/RELEASE_ARTIFACT_RULES.md"))).toBe(true);

    const sizeAudit = readProjectFile("docs/SIZE_AUDIT.md");
    const artifactRules = readProjectFile("docs/RELEASE_ARTIFACT_RULES.md");

    expect(sizeAudit).toContain("node_modules");
    expect(sizeAudit).toContain(".next");
    expect(sizeAudit).toContain("Do not bundle");
    expect(artifactRules).toContain("database");
    expect(artifactRules).toContain("node_modules");
    expect(artifactRules).toContain("resources");
    expect(artifactRules).toContain(".env");
  });

  it("keeps generated local artifacts out of source and container build contexts", () => {
    const gitignore = readProjectFile(".gitignore");
    const dockerignore = readProjectFile(".dockerignore");

    for (const pattern of [
      "node_modules",
      ".next",
      "test-results",
      "playwright-report",
      ".local",
      "public/uploads",
      "storage",
      "resources",
      ".env",
    ]) {
      expect(gitignore).toContain(pattern);
      expect(dockerignore).toContain(pattern);
    }
  });
});
