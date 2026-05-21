import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { canAccessResourceFile } from "../lib/resources/resource-access-policy";
import { createResourceStorageProvider } from "../lib/resources/storage-provider";
import { LocalResourceStorageProvider } from "../lib/resources/local-storage-provider";

const tempDirs: string[] = [];

function createTempDir() {
  const dir = mkdtempSync(join(tmpdir(), "eduos-resource-provider-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("cloud resource provider abstraction", () => {
  it("stores resource files through a local provider without committing resource payloads", async () => {
    const provider = new LocalResourceStorageProvider(createTempDir());
    const stored = await provider.putObject({
      tenantId: "tenant-1",
      resourceId: "resource-1",
      fileName: "word-book.csv",
      contentType: "text/csv",
      body: Buffer.from("hello,world", "utf8"),
    });

    expect(stored.storageKey).toContain("tenant-1/resource-1");
    expect(stored.byteSize).toBe(11);
    expect(stored.contentType).toBe("text/csv");
    expect(stored.localPath).toBeDefined();
    if (!stored.localPath) {
      throw new Error("Local provider did not return a localPath.");
    }
    expect(readFileSync(stored.localPath, "utf8")).toBe("hello,world");

    const download = await provider.createDownloadUrl({
      storageKey: stored.storageKey,
      expiresInSeconds: 300,
    });

    expect(download.url).toContain("/api/resources/local-download/");
    expect(download.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("keeps production cloud storage as an explicit placeholder provider", () => {
    const provider = createResourceStorageProvider({
      provider: "cloud-placeholder",
      localRoot: createTempDir(),
    });

    expect(provider.kind).toBe("cloud-placeholder");
  });

  it("authorizes resource downloads after tenant and role scope checks", () => {
    const resource = {
      tenantId: "tenant-1",
      ownerTeacherUserId: "teacher-1",
      studentUserIds: ["student-1"],
      guardianUserIds: ["parent-1"],
      guardianStudentUserIds: ["student-1"],
    };

    expect(
      canAccessResourceFile({ tenantId: "tenant-1", roleKey: "ORG_ADMIN", userId: "admin-1" }, resource),
    ).toBe(true);
    expect(
      canAccessResourceFile({ tenantId: "tenant-1", roleKey: "TEACHER", userId: "teacher-1" }, resource),
    ).toBe(true);
    expect(
      canAccessResourceFile({ tenantId: "tenant-1", roleKey: "STUDENT", userId: "student-1" }, resource),
    ).toBe(true);
    expect(
      canAccessResourceFile({ tenantId: "tenant-1", roleKey: "PARENT", userId: "parent-1" }, resource),
    ).toBe(true);
    expect(
      canAccessResourceFile({ tenantId: "tenant-2", roleKey: "ORG_ADMIN", userId: "admin-1" }, resource),
    ).toBe(false);
    expect(
      canAccessResourceFile({ tenantId: "tenant-1", roleKey: "STUDENT", userId: "student-2" }, resource),
    ).toBe(false);
  });

  it("documents cloud resource RFC and human cloud-account actions", () => {
    const rfc = readFileSync(join(process.cwd(), "docs/rfcs/RFC-CloudResourceManagement.md"), "utf8");
    const humanActions = readFileSync(join(process.cwd(), "docs/HUMAN_ACTIONS.md"), "utf8");

    expect(rfc).toContain("storage provider");
    expect(rfc).toContain("signed URL");
    expect(rfc).toContain("High-risk Items Not Executed");
    expect(humanActions).toContain("Cloud Resource Management");
    expect(humanActions).toContain("paid cloud storage");
  });
});
