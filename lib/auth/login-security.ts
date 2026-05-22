export type LoginSecurityState = {
  failedLoginCount: number;
  loginLockLevel: number;
  loginLockedUntil: Date | null;
  loginPermanentlyLockedAt: Date | null;
  lastFailedLoginAt: Date | null;
};

export type LoginAttemptDecision =
  | { allowed: true }
  | { allowed: false; reason: "temporary"; lockedUntil: Date }
  | { allowed: false; reason: "permanent" };

const failedAttemptsBeforeLock = 5;
const fiveMinuteLockMs = 5 * 60 * 1000;
const twentyFourHourLockMs = 24 * 60 * 60 * 1000;
const defaultSessionMaxAgeSeconds = 60 * 60 * 2;
const minimumSessionMaxAgeSeconds = 60;
const maximumSessionMaxAgeSeconds = 60 * 60 * 8;

export function canAttemptLogin(
  state: Pick<LoginSecurityState, "loginLockedUntil" | "loginPermanentlyLockedAt">,
  now = new Date(),
): LoginAttemptDecision {
  if (state.loginPermanentlyLockedAt) {
    return {
      allowed: false,
      reason: "permanent",
    };
  }

  if (state.loginLockedUntil && state.loginLockedUntil > now) {
    return {
      allowed: false,
      reason: "temporary",
      lockedUntil: state.loginLockedUntil,
    };
  }

  return {
    allowed: true,
  };
}

export function applyFailedLoginAttempt(
  state: LoginSecurityState,
  now = new Date(),
): LoginSecurityState {
  const failedLoginCount = state.failedLoginCount + 1;

  if (failedLoginCount < failedAttemptsBeforeLock) {
    return {
      failedLoginCount,
      loginLockLevel: state.loginLockLevel,
      loginLockedUntil: state.loginLockedUntil,
      loginPermanentlyLockedAt: state.loginPermanentlyLockedAt,
      lastFailedLoginAt: now,
    };
  }

  const nextLockLevel = Math.min(state.loginLockLevel + 1, 3);

  if (nextLockLevel >= 3) {
    return {
      failedLoginCount: 0,
      loginLockLevel: nextLockLevel,
      loginLockedUntil: null,
      loginPermanentlyLockedAt: now,
      lastFailedLoginAt: now,
    };
  }

  return {
    failedLoginCount: 0,
    loginLockLevel: nextLockLevel,
    loginLockedUntil: new Date(
      now.getTime() + (nextLockLevel === 1 ? fiveMinuteLockMs : twentyFourHourLockMs),
    ),
    loginPermanentlyLockedAt: null,
    lastFailedLoginAt: now,
  };
}

export function getSuccessfulLoginReset() {
  return {
    failedLoginCount: 0,
    loginLockedUntil: null,
    lastFailedLoginAt: null,
    lastLoginAt: new Date(),
  };
}

export function getAdminLoginUnlockReset() {
  return {
    failedLoginCount: 0,
    loginLockLevel: 0,
    loginLockedUntil: null,
    loginPermanentlyLockedAt: null,
    lastFailedLoginAt: null,
  };
}

export function getSessionMaxAgeSeconds(env: Record<string, string | undefined> = process.env) {
  const rawValue = env.EDUOS_SESSION_MAX_AGE_SECONDS;
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : defaultSessionMaxAgeSeconds;

  if (
    !Number.isFinite(parsedValue) ||
    parsedValue < minimumSessionMaxAgeSeconds ||
    parsedValue > maximumSessionMaxAgeSeconds
  ) {
    return defaultSessionMaxAgeSeconds;
  }

  return parsedValue;
}
