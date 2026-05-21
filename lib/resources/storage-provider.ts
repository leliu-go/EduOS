export type {
  CreateLegacyDownloadUrlInput as CreateResourceDownloadUrlInput,
  PutObjectInput as PutResourceObjectInput,
  SignedUrl as ResourceDownloadUrl,
  StorageProvider as ResourceStorageProvider,
  StorageProviderKind as ResourceStorageProviderKind,
  StoredObject as StoredResourceObject,
} from "@/lib/storage/StorageProvider";

export { createStorageProvider as createResourceStorageProvider } from "@/lib/storage";
