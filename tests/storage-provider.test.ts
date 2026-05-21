import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { loadAliyunOssConfigFromEnv, validateProductionEnv } from "../lib/env/production-env";
import {
  AliyunOssStorageProvider,
  createAliyunOssStorageProviderFromEnv,
} from "../lib/storage/aliyun-oss-provider";
import { createStorageProvider } from "../lib/storage";
import { LocalStorageProvider } from "../lib/storage/local-provider";
import type { FetchLike } from "../lib/storage/StorageProvider";

const tempDirs: string[] = [];

function createTempDir() {
  const dir = mkdtempSync(join(tmpdir(), "eduos-storage-provider-"));
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

describe("storage providers", () => {
  it("stores local resource payloads outside source-controlled folders", async () => {
    const provider = new LocalStorageProvider({
      rootDir: createTempDir(),
      bucket: "local-private",
    });

    const stored = await provider.putObject({
      tenantId: "tenant_1",
      resourceId: "resource_1",
      fileName: "word book.csv",
      contentType: "text/csv",
      body: Buffer.from("word,translation", "utf8"),
    });

    expect(stored.provider).toBe("local");
    expect(stored.bucket).toBe("local-private");
    expect(stored.objectKey).toBe("tenant_1/resource_1/word-book.csv");
    expect(stored.originalName).toBe("word book.csv");
    expect(stored.mimeType).toBe("text/csv");
    expect(stored.size).toBe(16);
    expect(stored.checksum).toHaveLength(64);
    expect(stored.localPath).toContain("local-private");
    expect(readFileSync(stored.localPath ?? "", "utf8")).toBe("word,translation");

    const signed = await provider.createSignedDownloadUrl({
      objectKey: stored.objectKey,
      expiresInSeconds: 60,
    });

    expect(signed.url).toContain("/api/resources/local-download/");
    expect(signed.url).toContain("expiresAt=");
    expect(signed.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("creates Aliyun OSS signed URLs without exposing the access key secret", async () => {
    const provider = new AliyunOssStorageProvider({
      accessKeyId: "test-access-key-id",
      accessKeySecret: "test-access-key-secret",
      bucket: "eduos-private",
      endpoint: "oss-cn-hangzhou.aliyuncs.com",
      region: "cn-hangzhou",
    });

    const signed = await provider.createSignedDownloadUrl({
      objectKey: "tenant-1/resource-1/handout.pdf",
      expiresInSeconds: 300,
    });

    expect(signed.url).toContain("https://eduos-private.oss-cn-hangzhou.aliyuncs.com/");
    expect(signed.url).toContain("OSSAccessKeyId=test-access-key-id");
    expect(signed.url).toContain("Signature=");
    expect(signed.url).not.toContain("test-access-key-secret");
  });

  it("uploads to Aliyun OSS through a mock transport without logging secrets", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: FetchLike = async (input, init) => {
      calls.push({ url: String(input), init });

      return new Response("", {
        status: 200,
        headers: {
          ETag: '"mock-etag"',
        },
      });
    };
    const provider = new AliyunOssStorageProvider({
      accessKeyId: "test-access-key-id",
      accessKeySecret: "test-access-key-secret",
      bucket: "eduos-private",
      endpoint: "oss-cn-hangzhou.aliyuncs.com",
      fetchImpl,
    });

    const stored = await provider.putObject({
      tenantId: "tenant-1",
      resourceId: "resource-1",
      fileName: "lesson.pdf",
      contentType: "application/pdf",
      body: Buffer.from("pdf-body", "utf8"),
    });

    expect(stored.provider).toBe("aliyun-oss");
    expect(stored.bucket).toBe("eduos-private");
    expect(stored.objectKey).toBe("tenant-1/resource-1/lesson.pdf");
    expect(stored.etag).toBe("mock-etag");
    expect(calls).toHaveLength(1);
    expect(calls[0]?.init?.method).toBe("PUT");
    expect(String(calls[0]?.init?.headers)).not.toContain("test-access-key-secret");
    expect(JSON.stringify(calls)).not.toContain("test-access-key-secret");
  });

  it("loads Aliyun OSS config from environment variables without printing values", () => {
    const env = {
      RESOURCE_STORAGE_PROVIDER: "aliyun-oss",
      ALIYUN_OSS_ACCESS_KEY_ID: "test-access-key-id",
      ALIYUN_OSS_ACCESS_KEY_SECRET: "test-access-key-secret",
      ALIYUN_OSS_BUCKET: "eduos-private",
      ALIYUN_OSS_ENDPOINT: "oss-cn-hangzhou.aliyuncs.com",
      ALIYUN_OSS_INTERNAL_ENDPOINT: "oss-cn-hangzhou-internal.aliyuncs.com",
      ALIYUN_OSS_PUBLIC_ENDPOINT: "oss-cn-hangzhou.aliyuncs.com",
      ALIYUN_OSS_REGION: "cn-hangzhou",
      ALIYUN_OSS_SIGNED_URL_TTL_SECONDS: "600",
    };

    const config = loadAliyunOssConfigFromEnv(env);
    const provider = createAliyunOssStorageProviderFromEnv(env);
    const report = validateProductionEnv(env);

    expect(config.bucket).toBe("eduos-private");
    expect(config.internalEndpoint).toBe("oss-cn-hangzhou-internal.aliyuncs.com");
    expect(config.publicEndpoint).toBe("oss-cn-hangzhou.aliyuncs.com");
    expect(config.signedUrlTtlSeconds).toBe(600);
    expect(provider.kind).toBe("aliyun-oss");
    expect(report.ok).toBe(true);
    expect(JSON.stringify(report)).not.toContain("test-access-key-secret");
    expect(report.redacted.ALIYUN_OSS_ACCESS_KEY_SECRET).toBe("set");
  });

  it("uses internal endpoint for upload and public endpoint for browser signed URLs", async () => {
    const calls: string[] = [];
    const fetchImpl: FetchLike = async (input) => {
      calls.push(String(input));

      return new Response("", {
        status: 200,
      });
    };
    const provider = new AliyunOssStorageProvider({
      accessKeyId: "test-access-key-id",
      accessKeySecret: "test-access-key-secret",
      bucket: "eduos-private",
      endpoint: "oss-cn-hangzhou.aliyuncs.com",
      internalEndpoint: "oss-cn-hangzhou-internal.aliyuncs.com",
      publicEndpoint: "oss-cn-hangzhou.aliyuncs.com",
      fetchImpl,
    });

    await provider.putObject({
      tenantId: "tenant-1",
      resourceId: "resource-1",
      fileName: "handout.pdf",
      contentType: "application/pdf",
      body: Buffer.from("body", "utf8"),
    });
    const signed = await provider.createSignedDownloadUrl({
      objectKey: "tenant-1/resource-1/handout.pdf",
      expiresInSeconds: 60,
    });

    expect(calls[0]).toContain("eduos-private.oss-cn-hangzhou-internal.aliyuncs.com");
    expect(signed.url).toContain("eduos-private.oss-cn-hangzhou.aliyuncs.com");
  });

  it("reports missing production OSS variables by name only", () => {
    const report = validateProductionEnv({
      RESOURCE_STORAGE_PROVIDER: "aliyun-oss",
      ALIYUN_OSS_BUCKET: "eduos-private",
    });

    expect(report.ok).toBe(false);
    expect(report.missing).toEqual(
      expect.arrayContaining([
        "ALIYUN_OSS_ACCESS_KEY_ID",
        "ALIYUN_OSS_ACCESS_KEY_SECRET",
        "ALIYUN_OSS_ENDPOINT",
      ]),
    );
    expect(JSON.stringify(report)).not.toContain("eduos-private");
  });

  it("selects local or Aliyun provider without adding production dependencies", () => {
    expect(
      createStorageProvider({
        env: {
          RESOURCE_STORAGE_PROVIDER: "local",
          RESOURCE_STORAGE_LOCAL_ROOT: createTempDir(),
        },
      }).kind,
    ).toBe("local");

    expect(
      createStorageProvider({
        env: {
          RESOURCE_STORAGE_PROVIDER: "aliyun-oss",
          ALIYUN_OSS_ACCESS_KEY_ID: "test-access-key-id",
          ALIYUN_OSS_ACCESS_KEY_SECRET: "test-access-key-secret",
          ALIYUN_OSS_BUCKET: "eduos-private",
          ALIYUN_OSS_ENDPOINT: "oss-cn-hangzhou.aliyuncs.com",
        },
      }).kind,
    ).toBe("aliyun-oss");
  });
});
