import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { RoleKey } from "@/lib/rbac/permissions";

export function getNotificationRecipientWhere(
  userId: string,
  roleKey: RoleKey,
): Prisma.NotificationWhereInput {
  return {
    OR: [{ recipientUserId: userId }, { recipientRoleKey: roleKey }],
  };
}

export async function getUserNotifications(tenantId: string, userId: string, roleKey: RoleKey) {
  return prisma.notification.findMany({
    where: {
      tenantId,
      status: {
        not: "ARCHIVED",
      },
      ...getNotificationRecipientWhere(userId, roleKey),
    },
    orderBy: [{ createdAt: "desc" }],
    take: 50,
  });
}
