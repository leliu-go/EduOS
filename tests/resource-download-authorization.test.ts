import { describe, expect, it, vi } from "vitest";

import {
  createAuthorizedResourceDownloadUrl,
  type ResourceDownloadScope,
} from "../lib/resources/download-authorization";
import { canAccessResourceFile } from "../lib/resources/resource-access-policy";
import type { StorageProvider } from "../lib/storage/StorageProvider";

function createProvider(): StorageProvider {
  return {
    kind: "local",
    bucket: "local-private",
    putObject: vi.fn(),
    createSignedDownloadUrl: vi.fn(async () => ({
      url: "/signed/resource-url",
      expiresAt: new Date("2026-05-21T12:00:00.000Z"),
    })),
    createDownloadUrl: vi.fn(async () => ({
      url: "/signed/resource-url",
      expiresAt: new Date("2026-05-21T12:00:00.000Z"),
    })),
  };
}

const resource: ResourceDownloadScope = {
  tenantId: "tenant-1",
  provider: "aliyun-oss",
  bucket: "eduos-private",
  objectKey: "tenant-1/resource-1/handout.pdf",
  ownerTeacherUserId: "teacher-1",
  studentUserIds: ["student-1"],
  guardianUserIds: ["parent-1"],
  guardianStudentUserIds: ["student-1"],
};

describe("resource download authorization", () => {
  it("generates a signed URL only after tenant and role checks pass", async () => {
    const provider = createProvider();

    const result = await createAuthorizedResourceDownloadUrl(
      { tenantId: "tenant-1", roleKey: "STUDENT", userId: "student-1" },
      resource,
      provider,
      { expiresInSeconds: 120 },
    );

    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(result.url).toBe("/signed/resource-url");
    }
    expect(provider.createSignedDownloadUrl).toHaveBeenCalledWith({
      bucket: "eduos-private",
      objectKey: "tenant-1/resource-1/handout.pdf",
      expiresInSeconds: 120,
    });
  });

  it("does not generate a signed URL for unauthorized students, teachers, or tenants", async () => {
    const provider = createProvider();

    await expect(
      createAuthorizedResourceDownloadUrl(
        { tenantId: "tenant-1", roleKey: "STUDENT", userId: "student-2" },
        resource,
        provider,
      ),
    ).resolves.toEqual({ allowed: false, reason: "forbidden" });
    await expect(
      createAuthorizedResourceDownloadUrl(
        { tenantId: "tenant-1", roleKey: "TEACHER", userId: "teacher-2" },
        resource,
        provider,
      ),
    ).resolves.toEqual({ allowed: false, reason: "forbidden" });
    await expect(
      createAuthorizedResourceDownloadUrl(
        { tenantId: "tenant-2", roleKey: "ORG_ADMIN", userId: "admin-1" },
        resource,
        provider,
      ),
    ).resolves.toEqual({ allowed: false, reason: "forbidden" });

    expect(provider.createSignedDownloadUrl).not.toHaveBeenCalled();
  });

  it("requires parent actors to be explicitly bound guardians", () => {
    expect(
      canAccessResourceFile(
        { tenantId: "tenant-1", roleKey: "PARENT", userId: "parent-1" },
        resource,
      ),
    ).toBe(true);
    expect(
      canAccessResourceFile(
        { tenantId: "tenant-1", roleKey: "PARENT", userId: "parent-2" },
        resource,
      ),
    ).toBe(false);
  });

  it("does not sign downloads when storage object metadata is missing", async () => {
    const provider = createProvider();

    await expect(
      createAuthorizedResourceDownloadUrl(
        { tenantId: "tenant-1", roleKey: "ORG_ADMIN", userId: "admin-1" },
        { ...resource, objectKey: null },
        provider,
      ),
    ).resolves.toEqual({ allowed: false, reason: "missing_object" });

    expect(provider.createSignedDownloadUrl).not.toHaveBeenCalled();
  });
});
