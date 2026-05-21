export type StorageProviderKind = "local" | "aliyun-oss" | "cloud-placeholder";

export type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type PutObjectInput = {
  tenantId: string;
  resourceId: string;
  fileName: string;
  contentType: string;
  body: Buffer | Uint8Array;
  objectKey?: string;
};

export type StoredObject = {
  provider: StorageProviderKind;
  bucket: string;
  objectKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  checksum: string;
  etag?: string;
  localPath?: string;
  storageKey: string;
  originalFileName: string;
  contentType: string;
  byteSize: number;
  checksumSha256: string;
};

export type CreateSignedUrlInput = {
  bucket?: string;
  objectKey: string;
  expiresInSeconds: number;
};

export type CreateLegacyDownloadUrlInput = {
  storageKey: string;
  bucket?: string;
  expiresInSeconds: number;
};

export type SignedUrl = {
  url: string;
  expiresAt: Date;
};

export type StorageProvider = {
  kind: StorageProviderKind;
  bucket: string;
  putObject(input: PutObjectInput): Promise<StoredObject>;
  createSignedDownloadUrl(input: CreateSignedUrlInput): Promise<SignedUrl>;
  createDownloadUrl(input: CreateLegacyDownloadUrlInput): Promise<SignedUrl>;
};

export function createStoredObject(input: {
  provider: StorageProviderKind;
  bucket: string;
  objectKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  checksum: string;
  etag?: string;
  localPath?: string;
}): StoredObject {
  return {
    ...input,
    storageKey: input.objectKey,
    originalFileName: input.originalName,
    contentType: input.mimeType,
    byteSize: input.size,
    checksumSha256: input.checksum,
  };
}
