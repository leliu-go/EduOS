export interface MfaCredentialModelDraft {
  modelName: "UserMfaCredential";
  tenantScoped: true;
  storesPlainTextSecrets: false;
  fields: readonly string[];
  auditEvents: readonly string[];
}

export interface TotpSetupRequest {
  tenantId: string;
  userId: string;
  email: string;
  issuer?: string;
}

export interface TotpSetupPlaceholder {
  provider: "totp";
  status: "requires_production_crypto";
  tenantId: string;
  userId: string;
  issuer: string;
  accountName: string;
  provisioningUri: null;
  secretPreview: null;
  requiredHumanActions: readonly string[];
  modelDraft: MfaCredentialModelDraft;
}

export interface TotpVerificationInput {
  tenantId: string;
  userId: string;
  token: string;
}

export type TotpVerificationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: "token_required" | "provider_not_configured";
    };

export interface MfaSecretPersistenceReadiness {
  canPersistSecrets: false;
  missingEnvironment: readonly string[];
  blocker: string;
}

const requiredMfaEnvironment = [
  "MFA_ENCRYPTION_KEY_ID",
  "MFA_TOTP_SECRET_ENCRYPTION_KEY",
  "MFA_BACKUP_CODE_PEPPER",
] as const;

export const mfaCredentialModelDraft: MfaCredentialModelDraft = {
  modelName: "UserMfaCredential",
  tenantScoped: true,
  storesPlainTextSecrets: false,
  fields: [
    "id",
    "tenantId",
    "userId",
    "status",
    "encryptedTotpSecret",
    "totpSecretKeyId",
    "backupCodeHash",
    "lastVerifiedAt",
    "failedAttemptCount",
    "lockedUntil",
    "createdAt",
    "updatedAt",
  ],
  auditEvents: [
    "mfa.enrollment.started",
    "mfa.enrollment.verified",
    "mfa.challenge.failed",
    "mfa.recovery.approved",
    "mfa.disabled",
  ],
};

export function createTotpSetupPlaceholder(request: TotpSetupRequest): TotpSetupPlaceholder {
  return {
    provider: "totp",
    status: "requires_production_crypto",
    tenantId: request.tenantId,
    userId: request.userId,
    issuer: request.issuer ?? "EduOS",
    accountName: request.email.toLowerCase(),
    provisioningUri: null,
    secretPreview: null,
    requiredHumanActions: [
      "Provision production secret encryption key or KMS key.",
      "Approve a non-destructive MFA credential migration.",
      "Choose recovery and support verification procedures.",
    ],
    modelDraft: mfaCredentialModelDraft,
  };
}

export function verifyTotpTokenPlaceholder(input: TotpVerificationInput): TotpVerificationResult {
  if (input.token.trim().length === 0) {
    return {
      ok: false,
      reason: "token_required",
    };
  }

  return {
    ok: false,
    reason: "provider_not_configured",
  };
}

export function getMfaSecretPersistenceReadiness(
  environment: Record<string, string | undefined> = process.env,
): MfaSecretPersistenceReadiness {
  const missingEnvironment = requiredMfaEnvironment.filter((key) => !environment[key]);

  return {
    canPersistSecrets: false,
    missingEnvironment,
    blocker:
      "MFA secret persistence is intentionally disabled until production encryption, backup code hashing, and migration approval are complete.",
  };
}
