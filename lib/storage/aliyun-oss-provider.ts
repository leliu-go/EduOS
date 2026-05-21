import { createHash, createHmac } from "node:crypto";

import {
  createStoredObject,
  type CreateLegacyDownloadUrlInput,
  type CreateSignedUrlInput,
  type FetchLike,
  type PutObjectInput,
  type SignedUrl,
  type StorageProvider,
  type StoredObject,
} from "@/lib/storage/StorageProvider";

import { loadAliyunOssConfigFromEnv, type EnvLike } from "@/lib/env/production-env";

export type AliyunOssStorageProviderConfig = {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  endpoint: string;
  internalEndpoint?: string;
  publicEndpoint?: string;
  region?: string;
  signedUrlTtlSeconds?: number;
  fetchImpl?: FetchLike;
};

function sanitizePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function toBuffer(body: Buffer | Uint8Array) {
  return Buffer.isBuffer(body) ? body : Buffer.from(body);
}

function normalizeEndpoint(endpoint: string) {
  return endpoint.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function encodeObjectKey(objectKey: string) {
  return objectKey.split("/").map(encodeURIComponent).join("/");
}

function getObjectKey(input: PutObjectInput) {
  return (
    input.objectKey ??
    [
      sanitizePathSegment(input.tenantId),
      sanitizePathSegment(input.resourceId),
      sanitizePathSegment(input.fileName),
    ].join("/")
  );
}

function getOssSignature(accessKeySecret: string, stringToSign: string) {
  return createHmac("sha1", accessKeySecret).update(stringToSign).digest("base64");
}

export class AliyunOssStorageProvider implements StorageProvider {
  readonly kind = "aliyun-oss" as const;
  readonly bucket: string;
  private readonly accessKeyId: string;
  private readonly accessKeySecret: string;
  private readonly internalEndpoint: string;
  private readonly publicEndpoint: string;
  private readonly fetchImpl: FetchLike;

  constructor(config: AliyunOssStorageProviderConfig) {
    this.accessKeyId = config.accessKeyId;
    this.accessKeySecret = config.accessKeySecret;
    this.bucket = config.bucket;
    this.internalEndpoint = normalizeEndpoint(config.internalEndpoint ?? config.endpoint);
    this.publicEndpoint = normalizeEndpoint(config.publicEndpoint ?? config.endpoint);
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async putObject(input: PutObjectInput): Promise<StoredObject> {
    const body = toBuffer(input.body);
    const objectKey = getObjectKey(input);
    const date = new Date().toUTCString();
    const resource = `/${this.bucket}/${objectKey}`;
    const stringToSign = ["PUT", "", input.contentType, date, resource].join("\n");
    const signature = getOssSignature(this.accessKeySecret, stringToSign);
    const url = `https://${this.bucket}.${this.internalEndpoint}/${encodeObjectKey(objectKey)}`;
    const response = await this.fetchImpl(url, {
      method: "PUT",
      headers: {
        Authorization: `OSS ${this.accessKeyId}:${signature}`,
        "Content-Type": input.contentType,
        Date: date,
      },
      body: body as unknown as BodyInit,
    });

    if (!response.ok) {
      throw new Error(`Aliyun OSS upload failed with status ${response.status}`);
    }

    const checksum = createHash("sha256").update(body).digest("hex");
    const etag = response.headers.get("ETag")?.replace(/^"|"$/g, "");

    return createStoredObject({
      provider: this.kind,
      bucket: this.bucket,
      objectKey,
      originalName: input.fileName,
      mimeType: input.contentType,
      size: body.byteLength,
      checksum,
      etag: etag ?? undefined,
    });
  }

  async createSignedDownloadUrl(input: CreateSignedUrlInput): Promise<SignedUrl> {
    const expiresAt = new Date(Date.now() + input.expiresInSeconds * 1000);
    const expires = Math.floor(expiresAt.getTime() / 1000);
    const bucket = input.bucket ?? this.bucket;
    const resource = `/${bucket}/${input.objectKey}`;
    const stringToSign = ["GET", "", "", String(expires), resource].join("\n");
    const signature = getOssSignature(this.accessKeySecret, stringToSign);
    const url = new URL(
      `https://${bucket}.${this.publicEndpoint}/${encodeObjectKey(input.objectKey)}`,
    );

    url.searchParams.set("Expires", String(expires));
    url.searchParams.set("OSSAccessKeyId", this.accessKeyId);
    url.searchParams.set("Signature", signature);

    return {
      url: url.toString(),
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

export function createAliyunOssStorageProviderFromEnv(env: EnvLike = process.env) {
  return new AliyunOssStorageProvider(loadAliyunOssConfigFromEnv(env));
}
