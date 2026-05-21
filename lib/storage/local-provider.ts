import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import {
  createStoredObject,
  type CreateLegacyDownloadUrlInput,
  type CreateSignedUrlInput,
  type PutObjectInput,
  type SignedUrl,
  type StorageProvider,
  type StoredObject,
} from "@/lib/storage/StorageProvider";

type LocalStorageProviderOptions = {
  rootDir: string;
  bucket?: string;
};

function sanitizePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function toBuffer(body: Buffer | Uint8Array) {
  return Buffer.isBuffer(body) ? body : Buffer.from(body);
}

function encodeStoragePath(bucket: string, objectKey: string) {
  return encodeURIComponent(`${bucket}/${objectKey}`);
}

export class LocalStorageProvider implements StorageProvider {
  readonly kind = "local" as const;
  readonly bucket: string;
  private readonly rootDir: string;

  constructor(options: LocalStorageProviderOptions | string) {
    if (typeof options === "string") {
      this.rootDir = options;
      this.bucket = "local-resource-storage";
      return;
    }

    this.rootDir = options.rootDir;
    this.bucket = options.bucket ?? "local-resource-storage";
  }

  async putObject(input: PutObjectInput): Promise<StoredObject> {
    const body = toBuffer(input.body);
    const objectKey =
      input.objectKey ??
      [
        sanitizePathSegment(input.tenantId),
        sanitizePathSegment(input.resourceId),
        sanitizePathSegment(input.fileName),
      ].join("/");
    const localPath = join(this.rootDir, this.bucket, ...objectKey.split("/"));
    const checksum = createHash("sha256").update(body).digest("hex");

    await mkdir(dirname(localPath), { recursive: true });
    await writeFile(localPath, body);

    return createStoredObject({
      provider: this.kind,
      bucket: this.bucket,
      objectKey,
      originalName: input.fileName,
      mimeType: input.contentType,
      size: body.byteLength,
      checksum,
      localPath,
    });
  }

  async createSignedDownloadUrl(input: CreateSignedUrlInput): Promise<SignedUrl> {
    const expiresAt = new Date(Date.now() + input.expiresInSeconds * 1000);
    const bucket = input.bucket ?? this.bucket;
    const encodedStoragePath = encodeStoragePath(bucket, input.objectKey);

    return {
      url: `/api/resources/local-download/${encodedStoragePath}?expiresAt=${encodeURIComponent(expiresAt.toISOString())}`,
      expiresAt,
    };
  }

  async createDownloadUrl(input: CreateLegacyDownloadUrlInput): Promise<SignedUrl> {
    return this.createSignedDownloadUrl({
      bucket: input.bucket,
      objectKey: input.storageKey,
      expiresInSeconds: input.expiresInSeconds,
    });
  }
}
