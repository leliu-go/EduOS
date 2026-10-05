import { redirect } from "next/navigation";

import { getAuthSessionPayload } from "@/lib/auth/session-cookie";
import { sessionSurvivesPasswordChange } from "@/lib/auth/session";
import type { RoleKey } from "@/lib/rbac/permissions";

export type CurrentUser = {
  id: string;
  name: string;
  email: string | null;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  campusId: string | null;
  roleId: string;
  roleKey: RoleKey;
  mfaVerifiedAt: number | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getAuthSessionPayload();

  if (!session) {
    return null;
  }

  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      loginPermanentlyLockedAt: true,
      passwordChangedAt: true,
      memberships: {
        where: {
          tenantId: session.tenantId,
          status: "ACTIVE",
        },
        select: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
          campusId: true,
          role: {
            select: {
              id: true,
              key: true,
              status: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  const membership = user?.memberships[0];

  if (
    !user ||
    user.status !== "ACTIVE" ||
    user.loginPermanentlyLockedAt ||
    !sessionSurvivesPasswordChange(session, user.passwordChangedAt) ||
    !membership ||
    membership.tenant.status !== "ACTIVE" ||
    membership.role.status !== "ACTIVE" ||
    membership.role.key !== session.roleKey
  ) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    tenantId: membership.tenant.id,
    tenantName: membership.tenant.name,
    tenantSlug: membership.tenant.slug,
    campusId: membership.campusId,
    roleId: membership.role.id,
    roleKey: membership.role.key,
    mfaVerifiedAt: session.mfaVerifiedAt ?? null,
  };
}

export async function requireCurrentUser(nextPath = "/dashboard") {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return currentUser;
}
