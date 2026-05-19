"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { hashPassword } from "@/lib/auth/password";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import {
  accountRoleNameMap,
  accountTargetRoleMap,
  getAccountInvitationValues,
  type AccountInvitationValues,
} from "./account-schema";

type AccountTargetProfile = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

function redirectWithAccountError(error: string): never {
  redirect(`/dashboard/accounts?error=${error}`);
}

function getProfileContact(values: AccountInvitationValues, profile: AccountTargetProfile) {
  return {
    email: values.email ?? profile.email ?? null,
    phone: values.phone ?? profile.phone ?? null,
  };
}

async function findTargetProfile(
  tx: Prisma.TransactionClient,
  tenantId: string,
  values: AccountInvitationValues,
) {
  if (values.targetType === "TEACHER") {
    return tx.teacherProfile.findFirst({
      where: {
        id: values.targetId,
        tenantId,
        userId: null,
      },
    });
  }

  if (values.targetType === "STUDENT") {
    return tx.studentProfile.findFirst({
      where: {
        id: values.targetId,
        tenantId,
        userId: null,
      },
    });
  }

  return tx.guardianProfile.findFirst({
    where: {
      id: values.targetId,
      tenantId,
      userId: null,
    },
  });
}

async function linkProfileToUser(
  tx: Prisma.TransactionClient,
  tenantId: string,
  values: AccountInvitationValues,
  userId: string,
) {
  if (values.targetType === "TEACHER") {
    return tx.teacherProfile.update({
      where: {
        id: values.targetId,
        tenantId,
      },
      data: {
        userId,
      },
    });
  }

  if (values.targetType === "STUDENT") {
    return tx.studentProfile.update({
      where: {
        id: values.targetId,
        tenantId,
      },
      data: {
        userId,
      },
    });
  }

  return tx.guardianProfile.update({
    where: {
      id: values.targetId,
      tenantId,
    },
    data: {
      userId,
    },
  });
}

export async function createAccountInvitationAction(formData: FormData) {
  const currentUser = await requirePermission("accounts:invite", {
    nextPath: "/dashboard/accounts",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getAccountInvitationValues(formData);

  if (!parsed.success) {
    redirectWithAccountError("invalid_input");
  }

  const passwordHash = await hashPassword(parsed.data.initialPassword);

  const result = await prisma.$transaction(async (tx) => {
    const profile = await findTargetProfile(tx, currentUser.tenantId, parsed.data);

    if (!profile) {
      return null;
    }

    const contact = getProfileContact(parsed.data, profile);
    const roleKey = accountTargetRoleMap[parsed.data.targetType];
    const role = await tx.role.upsert({
      where: {
        tenantId_key: {
          tenantId: currentUser.tenantId,
          key: roleKey,
        },
      },
      create: {
        tenantId: currentUser.tenantId,
        key: roleKey,
        name: accountRoleNameMap[roleKey] ?? roleKey,
      },
      update: {
        status: "ACTIVE",
        name: accountRoleNameMap[roleKey] ?? roleKey,
      },
    });
    const user = await tx.user.create({
      data: {
        name: profile.name,
        email: contact.email,
        phone: contact.phone,
        passwordHash,
      },
    });
    const membership = await tx.membership.create({
      data: {
        tenantId: currentUser.tenantId,
        userId: user.id,
        roleId: role.id,
      },
    });

    await linkProfileToUser(tx, currentUser.tenantId, parsed.data, user.id);

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "membership.create",
        entityType: "membership",
        entityId: membership.id,
        afterJson: {
          userId: user.id,
          roleKey,
          targetType: parsed.data.targetType,
          targetId: parsed.data.targetId,
        },
      },
      tx,
    );

    return {
      userId: user.id,
      membershipId: membership.id,
    };
  });

  if (!result) {
    redirectWithAccountError("target_not_found");
  }

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/teachers");
  redirect("/dashboard/accounts?created=1");
}
