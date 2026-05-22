import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth/current-user";

export async function getAccountInvitationTargets(tenantId: string, currentUser?: CurrentUser) {
  const teacherProfile =
    currentUser?.roleKey === "TEACHER"
      ? await prisma.teacherProfile.findUnique({
          where: {
            tenantId_userId: {
              tenantId,
              userId: currentUser.id,
            },
          },
          select: {
            id: true,
          },
        })
      : null;
  const teacherStudentScope =
    currentUser?.roleKey === "TEACHER"
      ? teacherProfile
        ? {
            classGroups: {
              some: {
                classGroup: {
                  primaryTeacherId: teacherProfile.id,
                },
              },
            },
          }
        : { id: "__teacher_profile_not_found__" }
      : {};
  const [teachers, students, guardians] = await prisma.$transaction([
    prisma.teacherProfile.findMany({
      where: {
        tenantId,
        userId: null,
        status: { not: "RESIGNED" },
        ...(currentUser?.roleKey === "TEACHER" ? { id: "__teacher_cannot_invite_teachers__" } : {}),
      },
      orderBy: { name: "asc" },
    }),
    prisma.studentProfile.findMany({
      where: {
        tenantId,
        userId: null,
        status: { not: "WITHDRAWN" },
        ...teacherStudentScope,
      },
      orderBy: { name: "asc" },
    }),
    prisma.guardianProfile.findMany({
      where: {
        tenantId,
        userId: null,
        status: "ACTIVE",
        ...(currentUser?.roleKey === "TEACHER" ? { id: "__teacher_cannot_invite_guardians__" } : {}),
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    teachers,
    students,
    guardians,
  };
}

export async function getAccountDirectory(tenantId: string) {
  return prisma.user.findMany({
    where: {
      memberships: {
        some: {
          tenantId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      failedLoginCount: true,
      loginLockLevel: true,
      loginLockedUntil: true,
      loginPermanentlyLockedAt: true,
      lastLoginAt: true,
      passwordChangedAt: true,
      memberships: {
        where: {
          tenantId,
        },
        select: {
          role: {
            select: {
              key: true,
              name: true,
            },
          },
          status: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
  });
}
