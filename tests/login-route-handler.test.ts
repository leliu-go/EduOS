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
    expect(loginPage).toContain('name="email"');
    expect(loginPage).toContain('type="email"');
    expect(loginPage).toContain('autoComplete="username"');
    expect(loginPage).toContain('name="password"');
    expect(loginPage).toContain('type="password"');
    expect(loginPage).toContain('autoComplete="current-password"');
    expect(route).toContain("request.formData()");
    expect(route).toContain("response.cookies.set");
    expect(route).toContain("x-forwarded-host");
    expect(route).toContain("APP_URL");
    expect(route).toContain("applyFailedLoginAttempt");
    expect(route).toContain("canAttemptLogin");
  });
});
