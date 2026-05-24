import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("standalone static asset preparation", () => {
  it("runs static asset preparation as part of pnpm build", () => {
    const packageJson = JSON.parse(readProjectFile("package.json")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts.build).toContain("prepare-standalone-static.mjs");
    expect(existsSync(join(rootDir, "scripts/prepare-standalone-static.mjs"))).toBe(true);

    const script = readProjectFile("scripts/prepare-standalone-static.mjs");

    expect(script).toContain("\"standalone\", \".next\", \"static\"");
    expect(script).toContain("\"standalone\", \"public\"");
    expect(script).toContain("server.js");
  });
});
