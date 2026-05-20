import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readProjectFile(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("app entry", () => {
  it("routes the root page into the real EduOS app instead of the setup placeholder", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain("getCurrentUser");
    expect(page).toContain("getRoleLandingPath");
    expect(page).toContain('redirect("/login")');
    expect(page).not.toContain("项目初始化完成");
  });

  it("opens the desktop helper at the login screen", () => {
    const helper = readProjectFile("start-eduos.ps1");

    expect(helper).toContain("http://localhost:3000/login");
  });
});
