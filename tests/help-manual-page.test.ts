import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("in-app help manual", () => {
  it("renders the manual directly instead of separate help cards", () => {
    const page = readProjectFile("app/(dashboard)/dashboard/help/page.tsx");

    expect(page).toContain("EduOS 使用手册");
    expect(page).toContain("manualSections");
    expect(page).toContain("PWA 安装");
    expect(page).toContain("Authenticator");
    expect(page).not.toContain("打开安全中心");
    expect(page).not.toContain("grid gap-4 md:grid-cols-2");
  });
});
