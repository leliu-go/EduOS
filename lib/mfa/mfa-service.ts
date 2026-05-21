import { writeAuditLog, type AuditLogClient } from "@/lib/audit/audit-log";
import type { EncryptedMfaSecret, MfaSecretEncryptionProvider } from "@/lib/mfa/mfa-crypto";
import { hashBackupCode, type BackupCodeHash } from "@/lib/mfa/mfa-crypto";

export type MfaAuditAction =
  | "mfa.enrollment.started"
  | "mfa.enrollment.verified"
  | "mfa.challenge.failed"
  | "mfa.backup_code.used"
  | "mfa.disabled";

export type PreparedMfaEnrollment = {
  tenantId: string;
  userId: string;
  provider: "totp";
  status: "PENDING_VERIFICATION";
  encryptedTotpSecret: EncryptedMfaSecret;
  totpSecretKeyId: string;
  backupCodeHashes: readonly BackupCodeHash[];
};

export async function prepareMfaEnrollment(input: {
  tenantId: string;
  userId: string;
  plainTextTotpSecret: string;
  backupCodes: readonly string[];
  backupCodePepper: string;
  encryptionProvider: MfaSecretEncryptionProvider;
}): Promise<PreparedMfaEnrollment> {
  const encryptedTotpSecret = await input.encryptionProvider.encrypt(input.plainTextTotpSecret);

  return {
    tenantId: input.tenantId,
    userId: input.userId,
    provider: "totp",
    status: "PENDING_VERIFICATION",
    encryptedTotpSecret,
    totpSecretKeyId: encryptedTotpSecret.keyId,
    backupCodeHashes: input.backupCodes.map((code) => hashBackupCode(code, input.backupCodePepper)),
  };
}

export async function writeMfaAuditLog(
  input: {
    tenantId: string;
    actorUserId: string;
    targetUserId: string;
    action: MfaAuditAction;
    reason?: string | null;
    metadata?: Record<string, string | number | boolean | null>;
  },
  client?: AuditLogClient,
) {
  return writeAuditLog(
    {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: "UserMfaCredential",
      entityId: input.targetUserId,
      afterJson: {
        targetUserId: input.targetUserId,
        metadata: input.metadata ?? {},
      },
      reason: input.reason ?? null,
    },
    client,
  );
}
