import { describe, expect, it } from "vitest";

import {
  coreBackupDatasetKeys,
  sanitizeCoreBackupPayload,
} from "../../lib/backup/core-data-sanitizer";

describe("core data backup payload", () => {
  it("includes only core structured dataset keys", () => {
    expect(coreBackupDatasetKeys).toEqual([
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
    ]);
    expect(coreBackupDatasetKeys).not.toContain("homeworkSubmissions");
    expect(coreBackupDatasetKeys).not.toContain("errorRecordImages");
  });

  it("removes secret, token, signed URL, and file attachment fields recursively", () => {
    const sanitized = sanitizeCoreBackupPayload({
      users: [
        {
          id: "user-a",
          name: "Admin",
          passwordHash: "pbkdf2-secret",
          encryptedTotpSecret: "totp-secret",
          backupCodeHash: "backup-code",
          sessionToken: "session",
        },
      ],
      resources: [
        {
          id: "resource-a",
          title: "讲义",
          fileUrl: "https://oss.example/private.pdf",
          signedUrl: "https://signed.example/private.pdf",
          accessKeySecret: "secret",
          metadata: {
            downloadToken: "token",
            mimeType: "application/pdf",
          },
        },
      ],
      homeworkSubmissions: [
        {
          id: "submission-a",
          attachmentsJson: [{ url: "https://oss.example/photo.jpg" }],
        },
      ],
    });

    const serialized = JSON.stringify(sanitized);
    expect(serialized).toContain("Admin");
    expect(serialized).toContain("application/pdf");
    expect(serialized).not.toContain("pbkdf2-secret");
    expect(serialized).not.toContain("totp-secret");
    expect(serialized).not.toContain("backup-code");
    expect(serialized).not.toContain("session");
    expect(serialized).not.toContain("signed.example");
    expect(serialized).not.toContain("accessKeySecret");
    expect(serialized).not.toContain("attachmentsJson");
  });
});
