import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { getAppVersion, getUpdateManifest } from "../lib/version/app-version";

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

  it("allows safe release metadata overrides without exposing secrets", () => {
    const originalEnv = {
      EDUOS_LATEST_VERSION: process.env.EDUOS_LATEST_VERSION,
      EDUOS_MIN_SUPPORTED_VERSION: process.env.EDUOS_MIN_SUPPORTED_VERSION,
      EDUOS_RELEASE_NOTES: process.env.EDUOS_RELEASE_NOTES,
      EDUOS_UPDATE_URL: process.env.EDUOS_UPDATE_URL,
      NEXT_PUBLIC_RELEASED_AT: process.env.NEXT_PUBLIC_RELEASED_AT,
      DATABASE_URL: process.env.DATABASE_URL,
    };

    process.env.EDUOS_LATEST_VERSION = "0.2.0";
    process.env.EDUOS_MIN_SUPPORTED_VERSION = "0.1.0";
    process.env.EDUOS_RELEASE_NOTES = "PWA update flow";
    process.env.EDUOS_UPDATE_URL = "https://eduos.study-go.top";
    process.env.NEXT_PUBLIC_RELEASED_AT = "2026-05-22T00:00:00.000Z";
    process.env.DATABASE_URL = "postgresql://secret-user:secret-pass@example.invalid/eduos";

    try {
      const manifest = getUpdateManifest();
      const serialized = JSON.stringify(manifest);

      expect(manifest.latestVersion).toBe("0.2.0");
      expect(manifest.minimumSupportedVersion).toBe("0.1.0");
      expect(manifest.minSupportedVersion).toBe("0.1.0");
      expect(manifest.releaseNotes).toContain("PWA update flow");
      expect(manifest.publishedAt).toBe("2026-05-22T00:00:00.000Z");
      expect(manifest.updateUrl).toBe("https://eduos.study-go.top");
      expect(serialized).not.toContain("secret-pass");
      expect(serialized).not.toContain("DATABASE_URL");
    } finally {
      for (const [key, value] of Object.entries(originalEnv)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
  });

  it("adds non-disruptive update UI and admin version pages", () => {
    expect(existsSync(join(rootDir, "components/version/update-available-banner.tsx"))).toBe(true);
    expect(existsSync(join(rootDir, "components/version/version-badge.tsx"))).toBe(true);
    expect(existsSync(join(rootDir, "components/version/check-update-button.tsx"))).toBe(true);
    expect(existsSync(join(rootDir, "components/version/version-update-panel.tsx"))).toBe(true);
    expect(existsSync(join(rootDir, "app/(dashboard)/dashboard/version/page.tsx"))).toBe(true);
    expect(existsSync(join(rootDir, "app/(dashboard)/dashboard/settings/version/page.tsx"))).toBe(
      true,
    );

    const banner = readProjectFile("components/version/update-available-banner.tsx");
    const checkButton = readProjectFile("components/version/check-update-button.tsx");
    const updatePanel = readProjectFile("components/version/version-update-panel.tsx");
    const versionPage = readProjectFile("app/(dashboard)/dashboard/settings/version/page.tsx");
    const sidebar = readProjectFile("components/layout/app-sidebar.tsx");
    const changelog = readProjectFile("CHANGELOG.md");

    expect(banner).toContain("UpdateAvailableBanner");
    expect(banner).toContain("/api/update-manifest");
    expect(banner).toContain("SKIP_WAITING");
    expect(checkButton).toContain("CheckUpdateButton");
    expect(checkButton).toContain("/api/update-manifest");
    expect(updatePanel).toContain("CheckUpdateButton");
    expect(versionPage).toContain('requirePermission("route:admin"');
    expect(versionPage).toContain("build time");
    expect(versionPage).toContain("short commit hash");
    expect(sidebar).toContain("/dashboard/settings/version");
    expect(changelog).toContain("0.1.0");
  });
});
