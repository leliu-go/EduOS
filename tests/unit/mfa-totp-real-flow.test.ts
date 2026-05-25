import { describe, expect, it } from "vitest";

import {
  createTotpProvisioningUri,
  generateTotpSecret,
  verifyTotpCode,
} from "../../lib/mfa/totp";

describe("real TOTP MFA flow", () => {
  it("generates a base32 secret compatible with authenticator apps", () => {
    const secret = generateTotpSecret();

    expect(secret).toMatch(/^[A-Z2-7]+$/);
    expect(secret.length).toBeGreaterThanOrEqual(32);
  });

  it("verifies RFC 6238 TOTP codes used by Microsoft Authenticator", () => {
    const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

    expect(
      verifyTotpCode({
        secret,
        token: "94287082",
        now: new Date("1970-01-01T00:00:59.000Z"),
        digits: 8,
        window: 0,
      }),
    ).toBe(true);

    expect(
      verifyTotpCode({
        secret,
        token: "00000000",
        now: new Date("1970-01-01T00:00:59.000Z"),
        digits: 8,
        window: 0,
      }),
    ).toBe(false);
  });

  it("creates an otpauth provisioning URI for Microsoft Authenticator scanning", () => {
    const uri = createTotpProvisioningUri({
      issuer: "EduOS",
      accountName: "admin@example.com",
      secret: "JBSWY3DPEHPK3PXP",
    });

    expect(uri).toContain("otpauth://totp/");
    expect(uri).toContain("issuer=EduOS");
    expect(uri).toContain("secret=JBSWY3DPEHPK3PXP");
    expect(uri).toContain("algorithm=SHA1");
    expect(uri).toContain("digits=6");
    expect(uri).toContain("period=30");
  });
});
