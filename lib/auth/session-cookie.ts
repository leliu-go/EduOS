import { cookies } from "next/headers";

import {
  createSessionToken,
  verifySessionToken,
  type AuthSessionPayload,
} from "@/lib/auth/session";

export const AUTH_SESSION_COOKIE = "eduos_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export async function setAuthSession(payload: AuthSessionPayload) {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_SESSION_COOKIE, createSessionToken(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    expires: new Date(payload.expiresAt),
  });
}

export async function getAuthSessionPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  return token ? verifySessionToken(token) : null;
}

export async function clearAuthSession() {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_SESSION_COOKIE);
}
