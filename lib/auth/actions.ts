"use server";

import { redirect } from "next/navigation";

import { getRoleLandingPath } from "@/lib/auth/landing-path";
import {
  applyFailedLoginAttempt,
  canAttemptLogin,
  getSuccessfulLoginReset,
} from "@/lib/auth/login-security";
import { verifyPassword } from "@/lib/auth/password";
import { setAuthSession, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session-cookie";
import { loginSchema } from "@/lib/auth/validation";
import { getFormDataString } from "@/lib/forms/form-data";

function redirectWithLoginError(error: string): never {
  redirect(`/login?error=${error}`);
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: getFormDataString(formData, "email"),
    password: getFormDataString(formData, "password"),
  });

  if (!parsed.success) {
    redirectWithLoginError("invalid_input");
  }

  const credentials = parsed.data;

  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: {
      email: credentials.email.toLowerCase(),
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

  if (!user || user.status !== "ACTIVE") {
    redirectWithLoginError("invalid_credentials");
  }

  const loginDecision = canAttemptLogin(user);

  if (!loginDecision.allowed) {
    redirectWithLoginError(
      loginDecision.reason === "permanent" ? "account_permanently_locked" : "account_locked",
    );
  }

  const passwordMatches = await verifyPassword(credentials.password, user.passwordHash);

  if (!passwordMatches) {
    const nextSecurityState = applyFailedLoginAttempt(user);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: nextSecurityState,
    });

    redirectWithLoginError("invalid_credentials");
  }

  const membership = user.memberships[0];

  if (!membership) {
    redirectWithLoginError("missing_context");
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: getSuccessfulLoginReset(),
  });

  await setAuthSession({
    userId: user.id,
    tenantId: membership.tenantId,
    roleKey: membership.role.key,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  });

  redirect(getRoleLandingPath(membership.role.key));
}

export async function logoutAction() {
  const { clearAuthSession } = await import("@/lib/auth/session-cookie");

  await clearAuthSession();
  redirect("/login");
}
