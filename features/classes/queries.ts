import { prisma } from "@/lib/prisma";

export async function getClassGroupList(tenantId: string) {
  return prisma.classGroup.findMany({
    where: {
      tenantId,
      status: {
        not: "ARCHIVED",
      },
    },
    include: {
      courseProduct: true,
      primaryTeacher: true,
      campus: true,
      _count: {
        select: {
          students: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { startsAt: "desc" }, { name: "asc" }],
  });
}

export async function getClassGroupById(tenantId: string, classGroupId: string) {
  return prisma.classGroup.findFirst({
    where: {
      id: classGroupId,
      tenantId,
    },
    include: {
      courseProduct: {
        include: {
          subject: true,
          grade: true,
        },
      },
      primaryTeacher: true,
      campus: true,
      students: {
        include: {
          student: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function getClassGroupFormOptions(tenantId: string) {
  const [courseProducts, teachers, campuses] = await prisma.$transaction([
    prisma.courseProduct.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      include: {
        subject: true,
        grade: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.teacherProfile.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.campus.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return {
    courseProducts,
    teachers,
    campuses,
  };
}

export async function getClassGroupStudentOptions(tenantId: string) {
  return prisma.studentProfile.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getTeacherClassGroups(tenantId: string, userId: string) {
  return prisma.classGroup.findMany({
    where: {
      tenantId,
      status: {
        in: ["PLANNING", "ACTIVE", "PAUSED"],
      },
      primaryTeacher: {
        userId,
      },
    },
    include: {
      courseProduct: {
        include: {
          subject: true,
          grade: true,
        },
      },
      campus: true,
      _count: {
        select: {
          students: true,
        },
      },
    },
    orderBy: [{ startsAt: "desc" }, { name: "asc" }],
  });
}
