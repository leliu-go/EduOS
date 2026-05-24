import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("PWA installation guidance and manual", () => {
  it("explains the browser-controlled desktop shortcut behavior", () => {
    const prompt = readProjectFile("components/install/install-pwa-prompt.tsx");

    expect(prompt).toContain("安装 EduOS");
    expect(prompt).toContain("开始菜单");
    expect(prompt).toContain("固定到任务栏");
    expect(prompt).toContain("浏览器决定");
    expect(prompt).not.toContain("瀹夎");
  });

  it("documents the app manual and PWA install troubleshooting", () => {
    expect(existsSync(join(rootDir, "docs/APP_MANUAL.md"))).toBe(true);

    const manual = readProjectFile("docs/APP_MANUAL.md");

    expect(manual).toContain("EduOS 使用手册");
    expect(manual).toContain("PWA 安装");
    expect(manual).toContain("安装后找不到桌面图标");
    expect(manual).toContain("Authenticator");
  });
});
