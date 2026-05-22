import { describe, expect, it } from "vitest";

import {
  applyFailedLoginAttempt,
  canAttemptLogin,
  getSessionMaxAgeSeconds,
} from "@/lib/auth/login-security";

describe("login security policy", () => {
  const now = new Date("2026-05-22T08:00:00.000Z");

  it("locks for 5 minutes, then 24 hours, then requires admin unlock", () => {
    let state = {
      failedLoginCount: 0,
      loginLockLevel: 0,
      loginLockedUntil: null as Date | null,
      loginPermanentlyLockedAt: null as Date | null,
      lastFailedLoginAt: null as Date | null,
    };

    for (let index = 0; index < 5; index += 1) {
      state = applyFailedLoginAttempt(state, now);
    }

    expect(state.failedLoginCount).toBe(0);
    expect(state.loginLockLevel).toBe(1);
    expect(state.loginLockedUntil?.toISOString()).toBe("2026-05-22T08:05:00.000Z");
    expect(canAttemptLogin(state, new Date("2026-05-22T08:04:59.000Z")).allowed).toBe(false);

    for (let index = 0; index < 5; index += 1) {
      state = applyFailedLoginAttempt(state, new Date("2026-05-22T08:05:01.000Z"));
    }

    expect(state.loginLockLevel).toBe(2);
    expect(state.loginLockedUntil?.toISOString()).toBe("2026-05-23T08:05:01.000Z");

    for (let index = 0; index < 5; index += 1) {
      state = applyFailedLoginAttempt(state, new Date("2026-05-23T08:05:02.000Z"));
    }

    expect(state.loginLockLevel).toBe(3);
    expect(state.loginPermanentlyLockedAt?.toISOString()).toBe("2026-05-23T08:05:02.000Z");
    expect(canAttemptLogin(state, new Date("2026-05-24T08:05:02.000Z"))).toEqual({
      allowed: false,
      reason: "permanent",
    });
  });

  it("uses a shorter default session and allows explicit env override", () => {
    expect(getSessionMaxAgeSeconds({})).toBe(60 * 60 * 2);
    expect(getSessionMaxAgeSeconds({ EDUOS_SESSION_MAX_AGE_SECONDS: "900" })).toBe(900);
    expect(getSessionMaxAgeSeconds({ EDUOS_SESSION_MAX_AGE_SECONDS: "10" })).toBe(60 * 60 * 2);
  });
});
