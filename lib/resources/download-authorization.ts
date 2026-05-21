import {
  canAccessResourceFile,
  type ResourceFileActor,
  type ResourceFileScope,
} from "@/lib/resources/resource-access-policy";
import { createStorageProvider, type StorageProvider } from "@/lib/storage";

export type ResourceDownloadScope = ResourceFileScope & {
  provider?: string | null;
  bucket?: string | null;
  objectKey?: string | null;
};

export type AuthorizedResourceDownload =
  | {
      allowed: true;
      url: string;
      expiresAt: Date;
    }
  | {
      allowed: false;
      reason: "forbidden" | "missing_object";
    };

type CreateAuthorizedResourceDownloadOptions = {
  expiresInSeconds?: number;
};

export async function createAuthorizedResourceDownloadUrl(
  actor: ResourceFileActor,
  resource: ResourceDownloadScope,
  provider: StorageProvider = createStorageProvider(),
  options: CreateAuthorizedResourceDownloadOptions = {},
): Promise<AuthorizedResourceDownload> {
  if (!canAccessResourceFile(actor, resource)) {
    return {
      allowed: false,
      reason: "forbidden",
    };
  }

  if (!resource.objectKey) {
    return {
      allowed: false,
      reason: "missing_object",
    };
  }

  const signed = await provider.createSignedDownloadUrl({
    bucket: resource.bucket ?? undefined,
    objectKey: resource.objectKey,
    expiresInSeconds: options.expiresInSeconds ?? 300,
  });

  return {
    allowed: true,
    url: signed.url,
    expiresAt: signed.expiresAt,
  };
}
