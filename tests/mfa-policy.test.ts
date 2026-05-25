import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  canManageOwnMfa,
  canManageTenantMfaPolicy,
  defaultTenantMfaPolicy,
  evaluateMfaRequirement,
  roleRequiresMfa,
} from "../lib/mfa/mfa-policy";
import {
  createTotpSetupPlaceholder,
  getMfaSecretPersistenceReadiness,
  mfaCredentialModelDraft,
  verifyTotpTokenPlaceholder,
} from "../lib/mfa/totp-placeholders";

describe("MFA policy", () => {
  it("requires MFA for high-privilege roles by default", () => {
    expect(roleRequiresMfa("SUPER_ADMIN")).toBe(true);
    expect(roleRequiresMfa("ORG_ADMIN")).toBe(true);
    expect(roleRequiresMfa("CAMPUS_ADMIN")).toBe(true);
    expect(roleRequiresMfa("ACADEMIC")).toBe(true);
    expect(roleRequiresMfa("FINANCE")).toBe(true);
    expect(roleRequiresMfa("TEACHER")).toBe(false);
    expect(roleRequiresMfa("STUDENT")).toBe(false);
    expect(roleRequiresMfa("PARENT")).toBe(false);
  });

  it("can be configured to require MFA for staff without affecting students or parents", () => {
    const allStaffPolicy = {
      ...defaultTenantMfaPolicy,
      enforcement: "all_staff" as const,
    };

    expect(roleRequiresMfa("TEACHER", allStaffPolicy)).toBe(true);
    expect(roleRequiresMfa("STUDENT", allStaffPolicy)).toBe(false);
    expect(roleRequiresMfa("PARENT", allStaffPolicy)).toBe(false);
  });

  it("keeps tenant MFA policy administration at organization-admin scope", () => {
    expect(canManageTenantMfaPolicy("SUPER_ADMIN")).toBe(true);
    expect(canManageTenantMfaPolicy("ORG_ADMIN")).toBe(true);
    expect(canManageTenantMfaPolicy("CAMPUS_ADMIN")).toBe(false);
    expect(canManageTenantMfaPolicy("FINANCE")).toBe(false);
    expect(canManageOwnMfa("FINANCE")).toBe(true);
    expect(canManageOwnMfa("STUDENT")).toBe(false);
  });

  it("blocks required roles until enrollment is verified", () => {
    expect(
      evaluateMfaRequirement({
        roleKey: "ORG_ADMIN",
        enrollmentStatus: "not_enrolled",
      }),
    ).toMatchObject({
      required: true,
      canProceed: false,
      reason: "enrollment_required",
    });

    expect(
      evaluateMfaRequirement({
        roleKey: "ORG_ADMIN",
        enrollmentStatus: "verified",
        sessionMfaVerified: false,
      }),
    ).toMatchObject({
      required: true,
      canProceed: false,
      reason: "verification_required",
    });

    expect(
      evaluateMfaRequirement({
        roleKey: "ORG_ADMIN",
        enrollmentStatus: "verified",
        sessionMfaVerified: true,
      }),
    ).toMatchObject({
      required: true,
      canProceed: true,
      reason: "verified",
    });

    expect(
      evaluateMfaRequirement({
        roleKey: "STUDENT",
        enrollmentStatus: "not_enrolled",
      }),
    ).toMatchObject({
      required: false,
      canProceed: true,
      reason: "role_not_required",
    });
  });
});

describe("TOTP placeholders", () => {
  it("defines a tenant-scoped MFA credential model draft without applying migrations", () => {
    expect(mfaCredentialModelDraft).toMatchObject({
      modelName: "UserMfaCredential",
      tenantScoped: true,
      storesPlainTextSecrets: false,
    });
    expect(mfaCredentialModelDraft.fields).toContain("tenantId");
    expect(mfaCredentialModelDraft.fields).toContain("encryptedTotpSecret");
    expect(mfaCredentialModelDraft.fields).toContain("backupCodeHash");
  });

  it("creates setup placeholders without generating real TOTP secrets", () => {
    const setup = createTotpSetupPlaceholder({
      tenantId: "tenant_1",
      userId: "user_1",
      email: "admin@example.com",
    });

    expect(setup.status).toBe("requires_production_crypto");
    expect(setup.issuer).toBe("EduOS");
    expect(setup.provisioningUri).toBeNull();
    expect(setup.secretPreview).toBeNull();
    expect(setup.requiredHumanActions).toContain("Provision production secret encryption key or KMS key.");
  });

  it("refuses token verification until a real TOTP provider is approved", () => {
    expect(
      verifyTotpTokenPlaceholder({
        tenantId: "tenant_1",
        userId: "user_1",
        token: "123456",
      }),
    ).toEqual({
      ok: false,
      reason: "provider_not_configured",
    });
  });

  it("records required environment placeholders", () => {
    const envExample = readFileSync(".env.example", "utf8");
    const readiness = getMfaSecretPersistenceReadiness({});

    expect(envExample).toContain('MFA_TOTP_ISSUER="EduOS"');
    expect(envExample).toContain("MFA_ENCRYPTION_KEY_ID=");
    expect(envExample).toContain("MFA_TOTP_SECRET_ENCRYPTION_KEY=");
    expect(envExample).toContain("MFA_BACKUP_CODE_PEPPER=");
    expect(readiness.canPersistSecrets).toBe(false);
    expect(readiness.missingEnvironment).toContain("MFA_TOTP_SECRET_ENCRYPTION_KEY");
  });

  it("allows TOTP secret persistence when all server MFA secrets are configured", () => {
    const readiness = getMfaSecretPersistenceReadiness({
      MFA_ENCRYPTION_KEY_ID: "prod-local-aes-gcm-v1",
      MFA_TOTP_SECRET_ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef",
      MFA_BACKUP_CODE_PEPPER: "abcdef0123456789abcdef0123456789",
    });

    expect(readiness.canPersistSecrets).toBe(true);
    expect(readiness.missingEnvironment).toEqual([]);
  });
});
