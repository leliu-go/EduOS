import type { CurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac/permissions";

export const globalSearchTake = 5;

export type GlobalSearchResult = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export type DashboardGlobalSearchResults = {
  students: GlobalSearchResult[];
  teachers: GlobalSearchResult[];
  classes: GlobalSearchResult[];
  courses: GlobalSearchResult[];
};

export function normalizeGlobalSearchQuery(query: string) {
  return query.trim().slice(0, 80);
}

function emptyGlobalSearchResults(): DashboardGlobalSearchResults {
  return {
    students: [],
    teachers: [],
    classes: [],
    courses: [],
  };
}

export async function getDashboardGlobalSearch(
  currentUser: CurrentUser,
  rawQuery: string,
): Promise<DashboardGlobalSearchResults> {
  const query = normalizeGlobalSearchQuery(rawQuery);

  if (!query) {
    return emptyGlobalSearchResults();
  }

  const canSearchStudents = hasPermission(currentUser.roleKey, "students:manage");
  const canSearchTeachers = hasPermission(currentUser.roleKey, "teachers:manage");
  const canSearchClasses = hasPermission(currentUser.roleKey, "classes:manage");
  const canSearchCourses = hasPermission(currentUser.roleKey, "courses:manage");

  const [students, teachers, classes, courses] = await Promise.all([
    canSearchStudents
      ? prisma.studentProfile.findMany({
          where: {
            tenantId: currentUser.tenantId,
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { grade: { contains: query, mode: "insensitive" } },
              { school: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            grade: true,
            school: true,
          },
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
          take: globalSearchTake,
        })
      : Promise.resolve([]),
    canSearchTeachers
      ? prisma.teacherProfile.findMany({
          where: {
            tenantId: currentUser.tenantId,
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
          take: globalSearchTake,
        })
      : Promise.resolve([]),
    canSearchClasses
      ? prisma.classGroup.findMany({
          where: {
            tenantId: currentUser.tenantId,
            status: {
              not: "ARCHIVED",
            },
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { courseProduct: { name: { contains: query, mode: "insensitive" } } },
              { primaryTeacher: { name: { contains: query, mode: "insensitive" } } },
            ],
          },
          select: {
            id: true,
            name: true,
            status: true,
            courseProduct: {
              select: {
                name: true,
              },
            },
            primaryTeacher: {
              select: {
                name: true,
              },
            },
          },
          orderBy: [{ status: "asc" }, { startsAt: "desc" }, { name: "asc" }],
          take: globalSearchTake,
        })
      : Promise.resolve([]),
    canSearchCourses
      ? prisma.courseProduct.findMany({
          where: {
            tenantId: currentUser.tenantId,
            status: {
              not: "ARCHIVED",
            },
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { subject: { name: { contains: query, mode: "insensitive" } } },
              { grade: { name: { contains: query, mode: "insensitive" } } },
            ],
          },
          select: {
            id: true,
            name: true,
            subject: {
              select: {
                name: true,
              },
            },
            grade: {
              select: {
                name: true,
              },
            },
          },
          orderBy: [{ status: "asc" }, { name: "asc" }],
          take: globalSearchTake,
        })
      : Promise.resolve([]),
  ]);

  return {
    students: students.map((student) => ({
      id: student.id,
      title: student.name,
      description: `${student.grade}${student.school ? ` · ${student.school}` : ""}`,
      href: `/dashboard/students/${student.id}`,
    })),
    teachers: teachers.map((teacher) => ({
      id: teacher.id,
      title: teacher.name,
      description: teacher.phone ?? teacher.email ?? "教师档案",
      href: `/dashboard/teachers/${teacher.id}`,
    })),
    classes: classes.map((classGroup) => ({
      id: classGroup.id,
      title: classGroup.name,
      description: `${classGroup.courseProduct.name} · ${classGroup.primaryTeacher.name}`,
      href: `/dashboard/classes/${classGroup.id}`,
    })),
    courses: courses.map((course) => ({
      id: course.id,
      title: course.name,
      description: `${course.subject.name} · ${course.grade.name}`,
      href: `/dashboard/courses/${course.id}`,
    })),
  };
}
