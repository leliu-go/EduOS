import { coreBackupDatasetKeys, type CoreBackupDatasetKey } from "@/lib/backup/core-data-sanitizer";

export type CoreDataSelector = {
  key: CoreBackupDatasetKey;
  description: string;
};

export const coreDataSelectors: readonly CoreDataSelector[] = coreBackupDatasetKeys.map((key) => ({
  key,
  description: `Tenant-scoped ${key} records for encrypted Admin core backup.`,
}));

export function getCoreDataSelectorKeys() {
  return coreDataSelectors.map((selector) => selector.key);
}
