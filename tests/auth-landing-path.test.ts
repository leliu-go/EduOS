import { describe, expect, it } from "vitest";

import { getRoleLandingPath } from "@/lib/auth/landing-path";

describe("auth landing path", () => {
  it("sends staff roles to the dashboard", () => {
    expect(getRoleLandingPath("SUPER_ADMIN")).toBe("/dashboard");
    expect(getRoleLandingPath("ORG_ADMIN")).toBe("/dashboard");
    expect(getRoleLandingPath("CAMPUS_ADMIN")).toBe("/dashboard");
    expect(getRoleLandingPath("ACADEMIC")).toBe("/dashboard");
    expect(getRoleLandingPath("FINANCE")).toBe("/dashboard");
  });

  it("sends mobile roles to their own portals", () => {
    expect(getRoleLandingPath("TEACHER")).toBe("/teacher");
    expect(getRoleLandingPath("STUDENT")).toBe("/student");
    expect(getRoleLandingPath("PARENT")).toBe("/parent");
  });
});
