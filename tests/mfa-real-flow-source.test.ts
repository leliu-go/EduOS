import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("MFA real enrollment and login flow wiring", () => {
  it("routes high-privilege password logins into enroll or challenge before dashboard access", () => {
    const route = readProjectFile("app/api/auth/login/route.ts");

    expect(route).toContain("getPostPasswordMfaLoginDecision");
    expect(route).toContain("getMfaEnrollmentStatus");
    expect(route).toContain("/mfa");
    expect(route).toContain("/mfa/setup");
    expect(route).toContain("mfaVerifiedAt");
  });

  it("enforces required MFA from server-side permission checks", () => {
    const currentUser = readProjectFile("lib/auth/current-user.ts");
    const requirePermission = readProjectFile("lib/rbac/require-permission.ts");

    expect(currentUser).toContain("mfaVerifiedAt");
    expect(requirePermission).toContain("enforceRequiredMfa");
    expect(requirePermission).toContain("/mfa");
    expect(requirePermission).toContain("/mfa/setup");
  });

  it("provides real enrollment actions without exposing plaintext secrets", () => {
    const actions = readProjectFile("features/mfa/actions.ts");
    const page = readProjectFile("app/(dashboard)/dashboard/settings/security/mfa/page.tsx");
    const setupPage = readProjectFile("app/(auth)/mfa/setup/page.tsx");
    const challengePage = readProjectFile("app/(auth)/mfa/page.tsx");

    expect(actions).toContain("startMfaEnrollmentAction");
    expect(actions).toContain("rebindMfaEnrollmentAction");
    expect(actions).toContain("confirmRebind");
    expect(actions).toContain("!currentUser.mfaVerifiedAt");
    expect(actions).toContain("verifyMfaEnrollmentAction");
    expect(actions).toContain("verifyMfaChallengeAction");
    expect(actions).toContain("writeMfaAuditLog");
    expect(actions).toContain("verifyTotpCode");
    expect(page).toContain("Microsoft Authenticator");
    expect(page).toContain("更换手机");
    expect(page).toContain("旧手机上的验证码会失效");
    expect(page).toContain("!currentUser.mfaVerifiedAt");
    expect(setupPage).toContain("!currentUser.mfaVerifiedAt");
    expect(page).toContain("qrCodeDataUrl");
    expect(page).toContain("name=\"token\"");
    expect(challengePage).toContain("Authenticator 验证");
    expect(challengePage).toContain("autoComplete=\"one-time-code\"");
    expect(actions).not.toContain("console.log");
  });
});
