import { prisma } from "@/lib/prisma";

export async function getCampusList(tenantId: string) {
  return prisma.campus.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
    },
    include: {
      _count: {
        select: {
          rooms: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });
}

export async function getCampusById(tenantId: string, campusId: string) {
  return prisma.campus.findFirst({
    where: {
      id: campusId,
      tenantId,
      status: "ACTIVE",
    },
    include: {
      rooms: {
        where: {
          status: { not: "INACTIVE" },
        },
        orderBy: [{ status: "asc" }, { name: "asc" }],
      },
    },
  });
}
