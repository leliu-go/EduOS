import { NextResponse, type NextRequest } from "next/server";

import { getRoleLandingPath } from "@/lib/auth/landing-path";
import {
  applyFailedLoginAttempt,
  canAttemptLogin,
  getSuccessfulLoginReset,
} from "@/lib/auth/login-security";
import { getPostPasswordMfaLoginDecision } from "@/lib/auth/mfa-login";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/session";
import { AUTH_SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session-cookie";
import { loginSchema } from "@/lib/auth/validation";
import { getFormDataString } from "@/lib/forms/form-data";
import { getMfaEnrollmentStatus } from "@/lib/mfa/mfa-status";
import { getTemporaryMfaPolicy } from "@/lib/mfa/temporary-access";
import { prisma } from "@/lib/prisma";

function getPublicBaseUrl(request: NextRequest) {
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }

  return request.nextUrl.origin;
}

function getPublicUrl(request: NextRequest, path: string) {
  return new URL(path, getPublicBaseUrl(request));
}

function loginRedirect(request: NextRequest, error: string) {
  return NextResponse.redirect(getPublicUrl(request, `/login?error=${error}`), 303);
}

function findUserByLoginIdentifier(identifier: string) {
  return prisma.user.findFirst({
    where: {
      OR: [
        {
          username: identifier,
        },
        {
          email: identifier,
        },
        {
          phone: identifier,
        },
      ],
    },
    include: {
      memberships: {
        where: {
          status: "ACTIVE",
          tenant: {
            status: "ACTIVE",
          },
          role: {
            status: "ACTIVE",
          },
        },
        include: {
          tenant: true,
          role: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
      },
    },
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = loginSchema.safeParse({
    identifier: getFormDataString(formData, "identifier"),
    password: getFormDataString(formData, "password"),
  });

  if (!parsed.success) {
    return loginRedirect(request, "invalid_input");
  }

  const credentials = parsed.data;
  const user = await findUserByLoginIdentifier(credentials.identifier);

  if (!user || user.status !== "ACTIVE") {
    return loginRedirect(request, "invalid_credentials");
  }

  const loginDecision = canAttemptLogin(user);

  if (!loginDecision.allowed) {
    return loginRedirect(
      request,
      loginDecision.reason === "permanent" ? "account_permanently_locked" : "account_locked",
    );
  }

  if (!(await verifyPassword(credentials.password, user.passwordHash))) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: applyFailedLoginAttempt(user),
    });

    return loginRedirect(request, "invalid_credentials");
  }

  const membership = user.memberships[0];

  if (!membership) {
    return loginRedirect(request, "missing_context");
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: getSuccessfulLoginReset(),
  });

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const landingPath = getRoleLandingPath(membership.role.key);
  const enrollmentStatus = await getMfaEnrollmentStatus({
    tenantId: membership.tenantId,
    userId: user.id,
  });
  const mfaDecision = getPostPasswordMfaLoginDecision({
    roleKey: membership.role.key,
    enrollmentStatus,
    sessionMfaVerified: false,
    policy: await getTemporaryMfaPolicy({
      tenantId: membership.tenantId,
      userId: user.id,
      roleKey: membership.role.key,
      enrollmentStatus,
    }),
  });
  const redirectPath =
    mfaDecision.action === "enroll"
      ? `/mfa/setup?next=${encodeURIComponent(landingPath)}`
      : mfaDecision.action === "challenge"
        ? `/mfa?next=${encodeURIComponent(landingPath)}`
        : landingPath;

  if (mfaDecision.action === "deny") {
    return loginRedirect(request, "mfa_locked");
  }

  const response = NextResponse.redirect(getPublicUrl(request, redirectPath), 303);

  response.cookies.set(
    AUTH_SESSION_COOKIE,
    createSessionToken({
      userId: user.id,
      tenantId: membership.tenantId,
      roleKey: membership.role.key,
      expiresAt,
      mfaVerifiedAt:
        mfaDecision.action === "allow" && mfaDecision.reason === "verified"
          ? Date.now()
          : undefined,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
      expires: new Date(expiresAt),
    },
  );

  return response;
}
