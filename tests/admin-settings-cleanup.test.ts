import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("admin settings information architecture", () => {
  it("keeps MFA in security center and consolidates backup under storage", () => {
    const settingsPage = readProjectFile("app/(dashboard)/dashboard/settings/page.tsx");
    const securityPage = readProjectFile("app/(dashboard)/dashboard/settings/security/page.tsx");
    const storagePage = readProjectFile("app/(dashboard)/dashboard/settings/storage/page.tsx");
    const backupPage = readProjectFile("app/(dashboard)/dashboard/settings/backup-devices/page.tsx");

    expect(settingsPage).toContain("存储与备份");
    expect(settingsPage).toContain("安全中心");
    expect(settingsPage).toContain("帮助文档");
    expect(settingsPage).not.toContain("Admin 本地备份");
    expect(settingsPage).not.toContain("/dashboard/settings/backup-devices");

    expect(securityPage).toContain("绑定 Authenticator");
    expect(securityPage).toContain("/dashboard/settings/security/mfa");
    expect(securityPage).not.toContain("disabled");

    expect(storagePage).toContain("PRIMARY_BACKUP");
    expect(storagePage).toContain("本地加密备份");
    expect(storagePage).toContain("不保存作业照片");
    expect(backupPage).toContain('redirect("/dashboard/settings/storage")');
  });

  it("turns version settings into read-only deployed version information", () => {
    const versionPage = readProjectFile("app/(dashboard)/dashboard/settings/version/page.tsx");

    expect(versionPage).toContain("当前部署版本");
    expect(versionPage).not.toContain("VersionUpdatePanel");
    expect(versionPage).not.toContain("CheckUpdateButton");
    expect(versionPage).not.toContain("检查更新");
  });

  it("adds a help manual entry for operators", () => {
    expect(existsSync(join(rootDir, "docs/APP_MANUAL.md"))).toBe(true);
    expect(existsSync(join(rootDir, "app/(dashboard)/dashboard/help/page.tsx"))).toBe(true);

    const manual = readProjectFile("docs/APP_MANUAL.md");
    const sidebar = readProjectFile("components/layout/app-sidebar.tsx");

    expect(manual).toContain("EduOS 使用手册");
    expect(manual).toContain("安装后找不到桌面图标");
    expect(sidebar).toContain("/dashboard/help");
  });
});
