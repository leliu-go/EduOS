import { describe, expect, it } from "vitest";

import { hashBackupCode } from "../../lib/mfa/mfa-crypto";
import {
  consumeMfaRecoveryCode,
  defaultMfaRecoveryPolicy,
} from "../../lib/mfa/mfa-recovery";

describe("MFA recovery policy", () => {
  it("requires hashed one-time recovery codes and admin approval", () => {
    expect(defaultMfaRecoveryPolicy).toMatchObject({
      recoveryRequiresAdminApproval: true,
      recoveryCodesAreOneTimeUse: true,
      maxRecoveryCodeUses: 1,
    });
  });

  it("consumes a matching recovery code without returning plaintext", () => {
    const pepper = "pepper-material-with-enough-length";
    const hashes = [
      hashBackupCode("first-code", pepper, "salt-a"),
      hashBackupCode("second-code", pepper, "salt-b"),
    ];

    const result = consumeMfaRecoveryCode({
      code: "first code",
      storedHashes: hashes,
      pepper,
    });

    expect(result).toMatchObject({
      accepted: true,
      usedHash: hashes[0],
      remainingHashes: [hashes[1]],
    });
    expect(JSON.stringify(result)).not.toContain("first-code");
  });
});
