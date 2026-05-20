import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("Windows installer strategy", () => {
  it("documents PWA-first packaging without bundling server data or resources", () => {
    const rfc = readFileSync("docs/rfcs/RFC-WindowsInstaller.md", "utf8");
    const strategy = readFileSync("docs/WINDOWS_INSTALLER_STRATEGY.md", "utf8");
    const combined = `${rfc}\n${strategy}`;

    expect(combined).toContain("PWA first");
    expect(combined).toContain("Tauri");
    expect(combined).toContain("Electron");
    expect(combined).toContain("Do not bundle the database");
    expect(combined).toContain("Do not bundle node_modules");
    expect(combined).toContain("Do not bundle course resources");
    expect(combined).toContain("Code signing requires human approval");
  });
});
