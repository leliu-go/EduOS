import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("production account setup script", () => {
  it("exists without hard-coded production passwords", () => {
    const scriptPath = join(process.cwd(), "scripts/setup-production-accounts.ts");
    const source = readFileSync(scriptPath, "utf8");

    expect(existsSync(scriptPath)).toBe(true);
    expect(source).toContain("--stdin");
    expect(source).toContain("username");
    expect(source).toContain("disableNonTargetAccounts");
    expect(source).not.toContain("Top@888@lc");
    expect(source).not.toContain("123123");
  });
});
