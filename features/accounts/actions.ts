"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { hashPassword } from "@/lib/auth/password";
import { verifyPassword } from "@/lib/auth/password";
import { getAdminLoginUnlockReset } from "@/lib/auth/login-security";
import type { Prisma } from "@/lib/generated/prisma/client";
import { getFormDataFile, getFormDataString } from "@/lib/forms/form-data";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";
import type { RoleKey } from "@/lib/rbac/permissions";

import { parseAccountImportCsv } from "./account-csv";
import { canManageAccountRole, canUnlockAccount } from "./account-policy";
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

function redirectWithScopedAccountError(error: string, redirectTo: string): never {
  redirect(`${redirectTo}?error=${error}`);
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
  currentUser?: { id: string; roleKey: RoleKey },
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
        ...(currentUser?.roleKey === "TEACHER"
          ? {
              classGroups: {
                some: {
                  classGroup: {
                    primaryTeacher: {
                      userId: currentUser.id,
                    },
                  },
                },
              },
            }
          : {}),
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
  const redirectTo = getFormDataString(formData, "redirectTo") ?? "/dashboard/accounts";

  if (!parsed.success) {
    redirectWithScopedAccountError("invalid_input", redirectTo);
  }

  const roleKey = accountTargetRoleMap[parsed.data.targetType];

  if (!canManageAccountRole(currentUser.roleKey, roleKey)) {
    redirectWithScopedAccountError("invalid_scope", redirectTo);
  }

  const passwordHash = await hashPassword(parsed.data.initialPassword);

  const result = await prisma.$transaction(async (tx) => {
    const profile = await findTargetProfile(tx, currentUser.tenantId, parsed.data, currentUser);

    if (!profile) {
      return null;
    }

    const contact = getProfileContact(parsed.data, profile);
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
    redirectWithScopedAccountError("target_not_found", redirectTo);
  }

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/teachers");
  revalidatePath("/teacher/accounts");
  redirect(`${redirectTo}?created=1`);
}

export async function unlockAccountAction(formData: FormData) {
  const currentUser = await requirePermission("accounts:unlock", {
    nextPath: "/dashboard/accounts",
    unauthorizedRedirectTo: "/unauthorized",
  });

  if (!canUnlockAccount(currentUser.roleKey)) {
    redirectWithAccountError("invalid_scope");
  }

  const userId = getFormDataString(formData, "userId") ?? "";

  if (!userId) {
    redirectWithAccountError("invalid_input");
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: {
        id: userId,
        memberships: {
          some: {
            tenantId: currentUser.tenantId,
          },
        },
      },
      select: {
        id: true,
        loginPermanentlyLockedAt: true,
        loginLockedUntil: true,
      },
    });

    if (!user) {
      return null;
    }

    const updatedUser = await tx.user.update({
      where: {
        id: user.id,
      },
      data: getAdminLoginUnlockReset(),
      select: {
        id: true,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "account.login_lock.unlock",
        entityType: "user",
        entityId: updatedUser.id,
        beforeJson: {
          loginPermanentlyLockedAt: user.loginPermanentlyLockedAt,
          loginLockedUntil: user.loginLockedUntil,
        },
        afterJson: getAdminLoginUnlockReset(),
      },
      tx,
    );

    return updatedUser;
  });

  if (!result) {
    redirectWithAccountError("target_not_found");
  }

  revalidatePath("/dashboard/accounts");
  redirect("/dashboard/accounts?unlocked=1");
}

export async function changeOwnPasswordAction(formData: FormData) {
  const redirectTo = getFormDataString(formData, "redirectTo") ?? "/dashboard/settings";
  const currentUser = await requireCurrentUser(redirectTo);
  const currentPassword = getFormDataString(formData, "currentPassword") ?? "";
  const nextPassword = getFormDataString(formData, "nextPassword") ?? "";
  const confirmPassword = getFormDataString(formData, "confirmPassword") ?? "";

  if (
    currentPassword.length < 1 ||
    nextPassword.length < 8 ||
    nextPassword.length > 100 ||
    nextPassword !== confirmPassword
  ) {
    redirect(`${redirectTo}?password=invalid`);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: currentUser.id,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    redirect(`${redirectTo}?password=invalid_current`);
  }

  const passwordHash = await hashPassword(nextPassword);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "account.password.change",
        entityType: "user",
        entityId: user.id,
        afterJson: {
          changedByOwner: true,
        },
      },
      tx,
    );
  });

  redirect(`${redirectTo}?password=changed`);
}

export async function importAccountsAction(formData: FormData) {
  const currentUser = await requirePermission("accounts:import", {
    nextPath: "/dashboard/accounts",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const file = getFormDataFile(formData, "file");

  if (!file) {
    redirectWithAccountError("invalid_input");
  }

  const rows = parseAccountImportCsv(await file.text()).filter((row) =>
    canManageAccountRole(currentUser.roleKey, row.role),
  );

  if (rows.length === 0) {
    redirectWithAccountError("invalid_input");
  }

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      let user = await tx.user.findFirst({
        where: {
          OR: [
            ...(row.email ? [{ email: row.email.toLowerCase() }] : []),
            ...(row.phone ? [{ phone: row.phone }] : []),
          ],
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        if (!row.initialPassword) {
          continue;
        }

        user = await tx.user.create({
          data: {
            name: row.name,
            email: row.email?.toLowerCase() ?? null,
            phone: row.phone ?? null,
            status: row.status,
            passwordHash: await hashPassword(row.initialPassword),
            passwordChangedAt: new Date(),
          },
          select: {
            id: true,
          },
        });
      } else {
        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            name: row.name,
            status: row.status,
          },
        });
      }

      const role = await tx.role.upsert({
        where: {
          tenantId_key: {
            tenantId: currentUser.tenantId,
            key: row.role,
          },
        },
        create: {
          tenantId: currentUser.tenantId,
          key: row.role,
          name: accountRoleNameMap[row.role] ?? row.role,
        },
        update: {
          status: "ACTIVE",
          name: accountRoleNameMap[row.role] ?? row.role,
        },
      });
      const existingMembership = await tx.membership.findFirst({
        where: {
          tenantId: currentUser.tenantId,
          userId: user.id,
          roleId: role.id,
        },
        select: {
          id: true,
        },
      });

      if (!existingMembership) {
        await tx.membership.create({
          data: {
            tenantId: currentUser.tenantId,
            userId: user.id,
            roleId: role.id,
          },
        });
      }
    }

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "accounts.import",
        entityType: "user",
        entityId: currentUser.tenantId,
        afterJson: {
          rowCount: rows.length,
        },
      },
      tx,
    );
  });

  revalidatePath("/dashboard/accounts");
  redirect("/dashboard/accounts?imported=1");
}
