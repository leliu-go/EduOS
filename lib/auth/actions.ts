"use server";

import { redirect } from "next/navigation";

import { getRoleLandingPath } from "@/lib/auth/landing-path";
import { verifyPassword } from "@/lib/auth/password";
import { setAuthSession, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session-cookie";
import { loginSchema } from "@/lib/auth/validation";

function redirectWithLoginError(error: string): never {
  redirect(`/login?error=${error}`);
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
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

  const passwordMatches = await verifyPassword(credentials.password, user.passwordHash);

  if (!passwordMatches) {
    redirectWithLoginError("invalid_credentials");
  }

  const membership = user.memberships[0];

  if (!membership) {
    redirectWithLoginError("missing_context");
  }

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
