import { LocalResourceStorageProvider } from "@/lib/resources/local-storage-provider";

export type ResourceStorageProviderKind = "local" | "cloud-placeholder";

export type PutResourceObjectInput = {
  tenantId: string;
  resourceId: string;
  fileName: string;
  contentType: string;
  body: Buffer | Uint8Array;
};

export type StoredResourceObject = {
  storageKey: string;
  originalFileName: string;
  contentType: string;
  byteSize: number;
  checksumSha256: string;
  localPath: string;
};

export type CreateResourceDownloadUrlInput = {
  storageKey: string;
  expiresInSeconds: number;
};

export type ResourceDownloadUrl = {
  url: string;
  expiresAt: Date;
};

export type ResourceStorageProvider = {
  kind: ResourceStorageProviderKind;
  putObject(input: PutResourceObjectInput): Promise<StoredResourceObject>;
  createDownloadUrl(input: CreateResourceDownloadUrlInput): Promise<ResourceDownloadUrl>;
};

type CreateResourceStorageProviderOptions = {
  provider?: ResourceStorageProviderKind;
  localRoot?: string;
};

class CloudPlaceholderResourceStorageProvider implements ResourceStorageProvider {
  readonly kind = "cloud-placeholder" as const;

  async putObject(): Promise<StoredResourceObject> {
    throw new Error("Cloud resource storage is not configured. Use a production provider adapter.");
  }

  async createDownloadUrl(): Promise<ResourceDownloadUrl> {
    throw new Error("Cloud resource storage is not configured. Use a production provider adapter.");
  }
}

export function createResourceStorageProvider(
  options: CreateResourceStorageProviderOptions = {},
): ResourceStorageProvider {
  const provider = options.provider ?? (process.env.RESOURCE_STORAGE_PROVIDER as ResourceStorageProviderKind | undefined) ?? "local";

  if (provider === "cloud-placeholder") {
    return new CloudPlaceholderResourceStorageProvider();
  }

  return new LocalResourceStorageProvider(
    options.localRoot ?? process.env.RESOURCE_STORAGE_LOCAL_ROOT ?? ".local/resource-storage",
  );
}
