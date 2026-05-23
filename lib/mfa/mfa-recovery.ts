import { verifyBackupCode, type BackupCodeHash } from "@/lib/mfa/mfa-crypto";

export const defaultMfaRecoveryPolicy = {
  recoveryRequiresAdminApproval: true,
  recoveryCodesAreOneTimeUse: true,
  maxRecoveryCodeUses: 1,
} as const;

export function consumeMfaRecoveryCode(input: {
  code: string;
  storedHashes: readonly BackupCodeHash[];
  pepper: string;
}):
  | { accepted: true; usedHash: BackupCodeHash; remainingHashes: readonly BackupCodeHash[] }
  | { accepted: false; remainingHashes: readonly BackupCodeHash[] } {
  const matchingHash = input.storedHashes.find((storedHash) =>
    verifyBackupCode(input.code, storedHash, input.pepper),
  );

  if (!matchingHash) {
    return {
      accepted: false,
      remainingHashes: input.storedHashes,
    };
  }

  return {
    accepted: true,
    usedHash: matchingHash,
    remainingHashes: input.storedHashes.filter((storedHash) => storedHash !== matchingHash),
  };
}
