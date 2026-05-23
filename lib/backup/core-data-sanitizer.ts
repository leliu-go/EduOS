export const coreBackupDatasetKeys = [
  "students",
  "guardians",
  "studentGuardians",
  "teachers",
  "courseProducts",
  "classGroups",
  "enrollments",
  "courseAccounts",
  "lessons",
  "schedules",
  "attendances",
  "courseConsumptions",
  "orders",
  "payments",
  "refunds",
  "activities",
  "activityAssignments",
  "resources",
  "resourcePermissions",
] as const;

export type CoreBackupDatasetKey = (typeof coreBackupDatasetKeys)[number];

const forbiddenKeyFragments = [
  "password",
  "passwordhash",
  "encryptedtotpsecret",
  "totpsecret",
  "backupcode",
  "session",
  "refreshtoken",
  "token",
  "signedurl",
  "accesskey",
  "secret",
  "privatekey",
  "recoverykey",
  "attachmentsjson",
  "fileurl",
  "photourl",
  "videourl",
  "audiourl",
];

function isForbiddenKey(key: string) {
  const normalized = key.toLowerCase();

  return forbiddenKeyFragments.some((fragment) => normalized.includes(fragment));
}

export function sanitizeCoreBackupPayload<T>(payload: T): T {
  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizeCoreBackupPayload(item)) as T;
  }

  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const sanitizedEntries = Object.entries(payload as Record<string, unknown>).flatMap(
    ([key, value]) => {
      if (isForbiddenKey(key)) {
        return [];
      }

      return [[key, sanitizeCoreBackupPayload(value)]];
    },
  );

  return Object.fromEntries(sanitizedEntries) as T;
}
