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

  it("starts a local EduOS PostgreSQL database without requiring Docker Desktop", () => {
    const helper = readProjectFile("start-eduos.ps1");

    expect(helper).toContain("Find-PostgresBin");
    expect(helper).toContain("Initialize-LocalPostgres");
    expect(helper).toContain("Start-LocalPostgres");
    expect(helper).toContain("Ensure-LocalDatabase");
    expect(helper).toContain("postgresql://${dbUser}:${dbPassword}@localhost:${dbPort}/${dbName}");
    expect(helper).toContain("pnpm exec prisma db push");
    expect(helper).toContain("pnpm prisma db seed");
    expect(helper).not.toContain("docker run");
    expect(helper).not.toContain("eduos-postgres");
  });

  it("reuses an already running EduOS dev server instead of launching another one", () => {
    const helper = readProjectFile("start-eduos.ps1");

    expect(helper).toContain("Test-AppReady");
    expect(helper).toContain("Wait-AppReady");
    expect(helper).toContain("Get-ListeningProcessId");
    expect(helper).toContain("taskkill /PID");
    expect(helper).toContain("pnpm dev -- --port 3000");
  });
});
