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
  });

  it("adds a non-disruptive update banner and admin version page", () => {
    expect(existsSync(join(rootDir, "components/version/update-available-banner.tsx"))).toBe(true);
    expect(existsSync(join(rootDir, "components/version/version-badge.tsx"))).toBe(true);
    expect(existsSync(join(rootDir, "app/(dashboard)/dashboard/version/page.tsx"))).toBe(true);

    const banner = readProjectFile("components/version/update-available-banner.tsx");
    const versionPage = readProjectFile("app/(dashboard)/dashboard/version/page.tsx");
    const changelog = readProjectFile("CHANGELOG.md");

    expect(banner).toContain("UpdateAvailableBanner");
    expect(banner).toContain("/api/update-manifest");
    expect(banner).toContain("稍后");
    expect(versionPage).toContain('requirePermission("route:admin"');
    expect(changelog).toContain("0.1.0");
  });
});
