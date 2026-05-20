import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type {
  CreateResourceDownloadUrlInput,
  PutResourceObjectInput,
  ResourceDownloadUrl,
  ResourceStorageProvider,
  StoredResourceObject,
} from "@/lib/resources/storage-provider";

function sanitizePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function toBuffer(body: Buffer | Uint8Array) {
  return Buffer.isBuffer(body) ? body : Buffer.from(body);
}

export class LocalResourceStorageProvider implements ResourceStorageProvider {
  readonly kind = "local" as const;

  constructor(private readonly rootDir: string) {}

  async putObject(input: PutResourceObjectInput): Promise<StoredResourceObject> {
    const body = toBuffer(input.body);
    const safeTenantId = sanitizePathSegment(input.tenantId);
    const safeResourceId = sanitizePathSegment(input.resourceId);
    const safeFileName = sanitizePathSegment(input.fileName);
    const storageKey = `${safeTenantId}/${safeResourceId}/${safeFileName}`;
    const targetDir = join(this.rootDir, safeTenantId, safeResourceId);
    const localPath = join(targetDir, safeFileName);

    await mkdir(targetDir, { recursive: true });
    await writeFile(localPath, body);

    return {
      storageKey,
      originalFileName: input.fileName,
      contentType: input.contentType,
      byteSize: body.byteLength,
      checksumSha256: createHash("sha256").update(body).digest("hex"),
      localPath,
    };
  }

  async createDownloadUrl(input: CreateResourceDownloadUrlInput): Promise<ResourceDownloadUrl> {
    const expiresAt = new Date(Date.now() + input.expiresInSeconds * 1000);
    const encodedStorageKey = encodeURIComponent(input.storageKey);

    return {
      url: `/api/resources/local-download/${encodedStorageKey}?expiresAt=${encodeURIComponent(expiresAt.toISOString())}`,
      expiresAt,
    };
  }
}
