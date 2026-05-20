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

  it("starts an isolated EduOS PostgreSQL container for local demos", () => {
    const helper = readProjectFile("start-eduos.ps1");

    expect(helper).toContain("eduos-postgres");
    expect(helper).toContain("55432:5432");
    expect(helper).toContain("postgresql://eduos:eduos_password@localhost:55432/eduos_dev");
    expect(helper).toContain("pnpm exec prisma db push");
    expect(helper).toContain("pnpm prisma db seed");
  });
});
