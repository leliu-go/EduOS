import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const parentContractInclude = {
  template: {
    select: {
      name: true,
      version: true,
    },
  },
  student: {
    select: {
      name: true,
      grade: true,
    },
  },
  guardian: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.ContractInclude;

export type ParentContractListItem = Prisma.ContractGetPayload<{
  include: typeof parentContractInclude;
}>;

export async function getParentContractList(
  tenantId: string,
  parentUserId: string,
  options: { limit?: number } = {},
) {
  return prisma.contract.findMany({
    where: {
      tenantId,
      student: {
        guardians: {
          some: {
            guardian: {
              tenantId,
              userId: parentUserId,
            },
          },
        },
      },
    },
    include: parentContractInclude,
    orderBy: [{ createdAt: "desc" }],
    take: options.limit,
  });
}
