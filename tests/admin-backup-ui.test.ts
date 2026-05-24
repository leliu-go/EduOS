import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("admin backup UI and docs", () => {
  it("keeps backup device status inside storage settings with explicit safety copy", () => {
    const storagePath = "app/(dashboard)/dashboard/settings/storage/page.tsx";
    const redirectPath = "app/(dashboard)/dashboard/settings/backup-devices/page.tsx";

    expect(existsSync(join(rootDir, storagePath))).toBe(true);
    expect(existsSync(join(rootDir, redirectPath))).toBe(true);

    const storagePage = readProjectFile(storagePath);
    const redirectPage = readProjectFile(redirectPath);

    expect(storagePage).toContain("adminBackup:manage");
    expect(storagePage).toContain("PRIMARY_BACKUP");
    expect(storagePage).toContain("本地加密备份");
    expect(storagePage).toContain("不保存作业照片");
    expect(redirectPage).toContain('redirect("/dashboard/settings/storage")');
  });

  it("documents multi-device admin login, primary backup device security, and disaster recovery", () => {
    for (const path of [
      "docs/ADMIN_MULTI_DEVICE_LOGIN_POLICY.md",
      "docs/ADMIN_BACKUP_DEVICE_SECURITY.md",
      "docs/ADMIN_DISASTER_RECOVERY_PLAN.md",
      "docs/LOCAL_BACKUP_RESTORE_RUNBOOK.md",
      "docs/CORE_BACKUP_EXPORT_FORMAT.md",
      "docs/CORE_BACKUP_RESTORE_LIMITATIONS.md",
      "docs/MFA_RECOVERY_POLICY.md",
    ]) {
      expect(existsSync(join(rootDir, path))).toBe(true);
    }

    const deviceDoc = readProjectFile("docs/ADMIN_BACKUP_DEVICE_SECURITY.md");
    const recoveryDoc = readProjectFile("docs/LOCAL_BACKUP_RESTORE_RUNBOOK.md");

    expect(deviceDoc).toContain("不使用 MAC 地址");
    expect(deviceDoc).toContain("PRIMARY_BACKUP");
    expect(deviceDoc).toContain("device private key signature");
    expect(recoveryDoc).toContain("RDS 自动备份/快照是第一恢复手段");
    expect(recoveryDoc).toContain("不恢复原 MFA secret");
  });
});
