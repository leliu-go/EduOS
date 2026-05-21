import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { getAppVersion } from "../lib/version/app-version";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("versioning and update detection", () => {
  it("uses package.json version as the single version source", () => {
    const packageJson = JSON.parse(readProjectFile("package.json")) as { version: string };
    const appVersion = getAppVersion();

    expect(appVersion.version).toBe(packageJson.version);
    expect(appVersion.name).toBe("eduos");
    expect(appVersion).toHaveProperty("buildTime");
    expect(appVersion).toHaveProperty("shortCommitHash");
  });

  it("exposes safe version and update manifest endpoints", () => {
    expect(existsSync(join(rootDir, "app/api/version/route.ts"))).toBe(true);
    expect(existsSync(join(rootDir, "app/api/update-manifest/route.ts"))).toBe(true);

    const versionRoute = readProjectFile("app/api/version/route.ts");
    const updateRoute = readProjectFile("app/api/update-manifest/route.ts");

    expect(versionRoute).toContain("getAppVersion");
    expect(updateRoute).toContain("getUpdateManifest");
    expect(versionRoute).not.toContain("DATABASE_URL");
    expect(updateRoute).not.toContain("AUTH_SECRET");
    expect(versionRoute).not.toContain("ALIYUN_OSS_ACCESS_KEY_SECRET");
    expect(updateRoute).not.toContain("MFA_TOTP_SECRET_ENCRYPTION_KEY");
  });

  it("adds non-disruptive update UI and admin version pages", () => {
    expect(existsSync(join(rootDir, "components/version/update-available-banner.tsx"))).toBe(true);
    expect(existsSync(join(rootDir, "components/version/version-badge.tsx"))).toBe(true);
    expect(existsSync(join(rootDir, "components/version/version-update-panel.tsx"))).toBe(true);
    expect(existsSync(join(rootDir, "app/(dashboard)/dashboard/version/page.tsx"))).toBe(true);
    expect(existsSync(join(rootDir, "app/(dashboard)/dashboard/settings/version/page.tsx"))).toBe(
      true,
    );

    const banner = readProjectFile("components/version/update-available-banner.tsx");
    const updatePanel = readProjectFile("components/version/version-update-panel.tsx");
    const versionPage = readProjectFile("app/(dashboard)/dashboard/settings/version/page.tsx");
    const sidebar = readProjectFile("components/layout/app-sidebar.tsx");
    const changelog = readProjectFile("CHANGELOG.md");

    expect(banner).toContain("UpdateAvailableBanner");
    expect(banner).toContain("/api/update-manifest");
    expect(banner).toContain("稍后");
    expect(banner).toContain("立即刷新");
    expect(updatePanel).toContain("检查更新");
    expect(updatePanel).toContain("刷新到新版");
    expect(versionPage).toContain('requirePermission("route:admin"');
    expect(versionPage).toContain("当前版本");
    expect(versionPage).toContain("build time");
    expect(versionPage).toContain("short commit hash");
    expect(sidebar).toContain("当前版本");
    expect(changelog).toContain("0.1.0");
  });
});
