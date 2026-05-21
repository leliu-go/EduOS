import { loadAliyunOssConfigFromEnv, type EnvLike } from "@/lib/env/production-env";
import { AliyunOssStorageProvider } from "@/lib/storage/aliyun-oss-provider";
import { LocalStorageProvider } from "@/lib/storage/local-provider";
import type {
  CreateLegacyDownloadUrlInput,
  CreateSignedUrlInput,
  FetchLike,
  PutObjectInput,
  SignedUrl,
  StorageProvider,
  StorageProviderKind,
  StoredObject,
} from "@/lib/storage/StorageProvider";

export * from "@/lib/storage/StorageProvider";
export { AliyunOssStorageProvider } from "@/lib/storage/aliyun-oss-provider";
export { LocalStorageProvider } from "@/lib/storage/local-provider";

type CreateStorageProviderOptions = {
  provider?: StorageProviderKind;
  env?: EnvLike;
  localRoot?: string;
  fetchImpl?: FetchLike;
};

class CloudPlaceholderStorageProvider implements StorageProvider {
  readonly kind = "cloud-placeholder" as const;
  readonly bucket = "cloud-placeholder";

  async putObject(): Promise<StoredObject> {
    throw new Error("Cloud resource storage is not configured.");
  }

  async createSignedDownloadUrl(_input?: CreateSignedUrlInput): Promise<SignedUrl> {
    void _input;

    throw new Error("Cloud resource storage is not configured.");
  }

  async createDownloadUrl(input: CreateLegacyDownloadUrlInput): Promise<SignedUrl> {
    return this.createSignedDownloadUrl({
      objectKey: input.storageKey,
      expiresInSeconds: input.expiresInSeconds,
    });
  }
}

export function createStorageProvider(options: CreateStorageProviderOptions = {}): StorageProvider {
  const env = options.env ?? process.env;
  const provider =
    options.provider ??
    (env.RESOURCE_STORAGE_PROVIDER as StorageProviderKind | undefined) ??
    "local";

  if (provider === "aliyun-oss") {
    return new AliyunOssStorageProvider({
      ...loadAliyunOssConfigFromEnv(env),
      fetchImpl: options.fetchImpl,
    });
  }

  if (provider === "cloud-placeholder") {
    return new CloudPlaceholderStorageProvider();
  }

  return new LocalStorageProvider({
    rootDir: options.localRoot ?? env.RESOURCE_STORAGE_LOCAL_ROOT ?? ".local/resource-storage",
    bucket: env.RESOURCE_STORAGE_LOCAL_BUCKET ?? "local-resource-storage",
  });
}

export async function putResourceObject(
  input: PutObjectInput,
  provider: StorageProvider = createStorageProvider(),
) {
  return provider.putObject(input);
}

export async function createResourceDownloadUrl(
  input: CreateSignedUrlInput,
  provider: StorageProvider = createStorageProvider(),
) {
  return provider.createSignedDownloadUrl(input);
}
