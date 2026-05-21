import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("PWA install capability", () => {
  it("defines a single EduOS PWA manifest for all roles", () => {
    expect(existsSync(join(rootDir, "app/manifest.ts"))).toBe(true);

    const manifest = readProjectFile("app/manifest.ts");

    expect(manifest).toContain('name: "EduOS"');
    expect(manifest).toContain('start_url: "/"');
    expect(manifest).toContain('scope: "/"');
    expect(manifest).toContain('display: "standalone"');
    expect(manifest).toContain("icons:");
    expect(manifest).not.toContain("teacher app");
    expect(manifest).not.toContain("student app");
  });

  it("registers a safe service worker without caching sensitive role data", () => {
    expect(existsSync(join(rootDir, "public/sw.js"))).toBe(true);

    const serviceWorker = readProjectFile("public/sw.js");
    const installPrompt = readProjectFile("components/install/install-pwa-prompt.tsx");
    const layout = readProjectFile("app/layout.tsx");

    for (const sensitivePath of [
      "/api/",
      "/login",
      "/dashboard",
      "/teacher",
      "/student",
      "/parent",
      "/unauthorized",
    ]) {
      expect(serviceWorker).toContain(sensitivePath);
    }

    expect(serviceWorker).toContain("networkOnly");
    expect(serviceWorker).toContain("STATIC_CACHE");
    expect(serviceWorker).toContain("CACHEABLE_STATIC_PREFIXES");
    expect(serviceWorker).toContain("isDevelopmentHost");
    expect(serviceWorker).toContain("self.registration.unregister");
    expect(serviceWorker).not.toContain('STATIC_ASSETS = ["/"');
    expect(installPrompt).toContain("process.env.NODE_ENV");
    expect(installPrompt).toContain("getRegistrations");
    expect(installPrompt).toContain("unregister");
    expect(layout).toContain("InstallPwaPrompt");
  });

  it("documents how staff, teachers, students, and parents install the same PWA", () => {
    expect(existsSync(join(rootDir, "docs/PWA_INSTALL_GUIDE.md"))).toBe(true);

    const guide = readProjectFile("docs/PWA_INSTALL_GUIDE.md");

    expect(guide).toContain("one EduOS PWA");
    expect(guide).toContain("same login");
    expect(guide).toContain("Do not cache");
  });
});
