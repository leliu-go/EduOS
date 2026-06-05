import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("login route handler", () => {
  it("uses a standard POST endpoint instead of production server-action form data", () => {
    const loginPage = readFileSync(join(process.cwd(), "app/(auth)/login/page.tsx"), "utf8");
    const routePath = join(process.cwd(), "app/api/auth/login/route.ts");
    const route = readFileSync(routePath, "utf8");

    expect(existsSync(routePath)).toBe(true);
    expect(loginPage).toContain('action="/api/auth/login"');
    expect(loginPage).toContain('method="post"');
    expect(loginPage).toContain('name="identifier"');
    expect(loginPage).toContain('type="text"');
    expect(loginPage).toContain('autoComplete="username"');
    expect(loginPage).toContain('name="password"');
    expect(loginPage).toContain('type="password"');
    expect(loginPage).toContain('autoComplete="current-password"');
    expect(route).toContain("request.formData()");
    expect(route).toContain("response.cookies.set");
    expect(route).toContain("APP_URL");
    expect(route).toContain("request.nextUrl.origin");
    expect(route).not.toContain("x-forwarded-host");
    expect(route).not.toContain("x-forwarded-proto");
    expect(route).toContain("applyFailedLoginAttempt");
    expect(route).toContain("canAttemptLogin");
    expect(route).toContain("findUserByLoginIdentifier");
  });

  it("keeps login logic in the route handler instead of a duplicate server action", () => {
    const authActions = readFileSync(join(process.cwd(), "lib/auth/actions.ts"), "utf8");

    expect(authActions).not.toContain("loginAction");
    expect(authActions).toContain("logoutAction");
    expect(authActions).not.toContain("loginSchema");
    expect(authActions).not.toContain("verifyPassword");
    expect(authActions).not.toContain("applyFailedLoginAttempt");
  });
});
