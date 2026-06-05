import type { Prisma, RoleKey } from "../lib/generated/prisma/client";
import { hashPassword } from "../lib/auth/password";
import { getAdminLoginUnlockReset } from "../lib/auth/login-security";
import { prisma } from "../lib/prisma";

type ProductionAccountInput = {
  username: string;
  password: string;
  roleKey: RoleKey;
  name: string;
  email?: string | null;
  phone?: string | null;
};

type ProductionAccountSetupPayload = {
  tenantSlug?: string;
  disableNonTargetAccounts?: boolean;
  accounts: ProductionAccountInput[];
};

const roleNameMap = {
  SUPER_ADMIN: "超级管理员",
  ORG_ADMIN: "机构管理员",
  CAMPUS_ADMIN: "校区管理员",
  ACADEMIC: "教务",
  FINANCE: "财务",
  TEACHER: "老师",
  STUDENT: "学生",
  PARENT: "家长",
} as const satisfies Record<RoleKey, string>;

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase();
}

function readStdin() {
  return new Promise<string>((resolve, reject) => {
    let data = "";

    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

function parsePayload(raw: string): ProductionAccountSetupPayload {
  const parsed = JSON.parse(raw) as Partial<ProductionAccountSetupPayload>;

  if (!Array.isArray(parsed.accounts) || parsed.accounts.length === 0) {
    throw new Error("accounts must be a non-empty array.");
  }

  return {
    tenantSlug: typeof parsed.tenantSlug === "string" ? parsed.tenantSlug : undefined,
    disableNonTargetAccounts: parsed.disableNonTargetAccounts === true,
    accounts: parsed.accounts.map((account) => {
      if (
        !account ||
        typeof account.username !== "string" ||
        typeof account.password !== "string" ||
        typeof account.name !== "string" ||
        typeof account.roleKey !== "string"
      ) {
        throw new Error("Each account requires username, password, roleKey, and name.");
      }

      return {
        username: normalizeIdentifier(account.username),
        password: account.password,
        roleKey: account.roleKey,
        name: account.name.trim(),
        email: account.email ? normalizeIdentifier(account.email) : null,
        phone: account.phone ? account.phone.trim() : null,
      };
    }),
  };
}

async function findTenant(slug?: string) {
  if (slug) {
    return prisma.tenant.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });
  }

  return prisma.tenant.findFirst({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });
}

async function ensureRole(
  tx: Prisma.TransactionClient,
  tenantId: string,
  roleKey: RoleKey,
) {
  return tx.role.upsert({
    where: {
      tenantId_key: {
        tenantId,
        key: roleKey,
      },
    },
    create: {
      tenantId,
      key: roleKey,
      name: roleNameMap[roleKey],
    },
    update: {
      status: "ACTIVE",
      name: roleNameMap[roleKey],
    },
  });
}

async function upsertTeacherProfile(
  tx: Prisma.TransactionClient,
  tenantId: string,
  userId: string,
  account: ProductionAccountInput,
) {
  if (account.roleKey !== "TEACHER") {
    return;
  }

  const existing = await tx.teacherProfile.findFirst({
    where: {
      tenantId,
      userId,
    },
    select: {
      id: true,
    },
  });

  const phone = account.phone ?? account.username;

  if (existing) {
    await tx.teacherProfile.update({
      where: {
        id: existing.id,
      },
      data: {
        name: account.name,
        phone,
        email: account.email ?? null,
        status: "ACTIVE",
      },
    });
    return;
  }

  await tx.teacherProfile.create({
    data: {
      tenantId,
      userId,
      name: account.name,
      phone,
      email: account.email ?? null,
      subjects: [],
      grades: [],
      status: "ACTIVE",
    },
  });
}

async function setupAccounts(payload: ProductionAccountSetupPayload) {
  const tenant = await findTenant(payload.tenantSlug);

  if (!tenant) {
    throw new Error("No active tenant found for production account setup.");
  }

  return prisma.$transaction(async (tx) => {
    const targetUserIds: string[] = [];

    for (const account of payload.accounts) {
      const passwordHash = await hashPassword(account.password);
      const user = await tx.user.upsert({
        where: {
          username: account.username,
        },
        create: {
          username: account.username,
          name: account.name,
          email: account.email ?? null,
          phone: account.phone ?? null,
          passwordHash,
          status: "ACTIVE",
          passwordChangedAt: new Date(),
          ...getAdminLoginUnlockReset(),
        },
        update: {
          name: account.name,
          email: account.email ?? null,
          phone: account.phone ?? null,
          passwordHash,
          status: "ACTIVE",
          passwordChangedAt: new Date(),
          ...getAdminLoginUnlockReset(),
        },
        select: {
          id: true,
        },
      });
      const role = await ensureRole(tx, tenant.id, account.roleKey);
      const membership = await tx.membership.findFirst({
        where: {
          tenantId: tenant.id,
          userId: user.id,
          roleId: role.id,
          campusId: null,
        },
        select: {
          id: true,
        },
      });

      if (membership) {
        await tx.membership.update({
          where: {
            id: membership.id,
          },
          data: {
            status: "ACTIVE",
          },
        });
      } else {
        await tx.membership.create({
          data: {
            tenantId: tenant.id,
            userId: user.id,
            roleId: role.id,
            status: "ACTIVE",
          },
        });
      }

      await upsertTeacherProfile(tx, tenant.id, user.id, account);
      targetUserIds.push(user.id);
    }

    const disabledMemberships = payload.disableNonTargetAccounts
      ? await tx.membership.updateMany({
          where: {
            tenantId: tenant.id,
            userId: {
              notIn: targetUserIds,
            },
          },
          data: {
            status: "DISABLED",
          },
        })
      : { count: 0 };

    await tx.auditLog.create({
      data: {
        tenantId: tenant.id,
        actorUserId: null,
        action: "accounts.production.bootstrap",
        entityType: "tenant",
        entityId: tenant.id,
        afterJson: {
          usernames: payload.accounts.map((account) => account.username),
          disableNonTargetAccounts: payload.disableNonTargetAccounts === true,
          disabledMembershipCount: disabledMemberships.count,
        },
      },
    });

    return {
      tenantSlug: tenant.slug,
      accountCount: targetUserIds.length,
      disabledMembershipCount: disabledMemberships.count,
    };
  });
}

async function main() {
  if (!process.argv.includes("--stdin")) {
    throw new Error("Pass setup payload through stdin with --stdin. Do not put passwords in commands.");
  }

  const payload = parsePayload(await readStdin());
  const result = await setupAccounts(payload);

  console.log(
    `Production account setup completed for tenant ${result.tenantSlug}: ${result.accountCount} accounts updated, ${result.disabledMembershipCount} old memberships disabled.`,
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Production account setup failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
