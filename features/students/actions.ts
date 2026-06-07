"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { getStudentFormValues, studentIdSchema, type StudentFormValues } from "./student-schema";

function redirectWithStudentError(path: string, error: string): never {
  redirect(`${path}?error=${error}`);
}

function toStudentMutationData(values: StudentFormValues) {
  return {
    name: values.name,
    gender: values.gender ?? null,
    birthday: values.birthday ?? null,
    grade: values.grade,
    school: values.school ?? null,
    status: values.status,
    notes: values.notes ?? null,
  };
}

function toAuditSnapshot(student: {
  id: string;
  tenantId: string;
  name: string;
  gender: string | null;
  birthday: Date | null;
  grade: string;
  school: string | null;
  status: string;
  notes: string | null;
}) {
  return {
    id: student.id,
    tenantId: student.tenantId,
    name: student.name,
    gender: student.gender,
    birthday: student.birthday,
    grade: student.grade,
    school: student.school,
    status: student.status,
    notes: student.notes,
  };
}

export async function createStudentAction(formData: FormData) {
  const currentUser = await requirePermission("students:manage", {
    nextPath: "/dashboard/students",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getStudentFormValues(formData);

  if (!parsed.success) {
    redirectWithStudentError("/dashboard/students", "invalid_input");
  }

  const student = await prisma.$transaction(async (tx) => {
    const createdStudent = await tx.studentProfile.create({
      data: {
        tenantId: currentUser.tenantId,
        ...toStudentMutationData(parsed.data),
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "student.create",
        entityType: "student",
        entityId: createdStudent.id,
        afterJson: toAuditSnapshot(createdStudent),
      },
      tx,
    );

    return createdStudent;
  });

  revalidatePath("/dashboard/students");
  redirect(`/dashboard/students/${student.id}`);
}

export async function updateStudentAction(formData: FormData) {
  const currentUser = await requirePermission("students:manage", {
    nextPath: "/dashboard/students",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedStudentId = studentIdSchema.safeParse(formData.get("studentId"));
  const parsed = getStudentFormValues(formData);

  if (!parsedStudentId.success || !parsed.success) {
    redirectWithStudentError("/dashboard/students", "invalid_input");
  }

  const student = await prisma.$transaction(async (tx) => {
    const beforeStudent = await tx.studentProfile.findFirst({
      where: {
        id: parsedStudentId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeStudent) {
      return null;
    }

    const updatedStudent = await tx.studentProfile.update({
      where: {
        id: beforeStudent.id,
      },
      data: toStudentMutationData(parsed.data),
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "student.update",
        entityType: "student",
        entityId: updatedStudent.id,
        beforeJson: toAuditSnapshot(beforeStudent),
        afterJson: toAuditSnapshot(updatedStudent),
      },
      tx,
    );

    return updatedStudent;
  });

  if (!student) {
    redirectWithStudentError("/dashboard/students", "not_found");
  }

  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${student.id}`);
  redirect(`/dashboard/students/${student.id}`);
}

export async function deleteStudentAction(formData: FormData) {
  const currentUser = await requirePermission("students:manage", {
    nextPath: "/dashboard/students",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedStudentId = studentIdSchema.safeParse(formData.get("studentId"));

  if (!parsedStudentId.success) {
    redirectWithStudentError("/dashboard/students", "invalid_input");
  }

  const student = await prisma.$transaction(async (tx) => {
    const beforeStudent = await tx.studentProfile.findFirst({
      where: {
        id: parsedStudentId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeStudent) {
      return null;
    }

    const updatedStudent = await tx.studentProfile.update({
      where: {
        id: beforeStudent.id,
      },
      data: {
        status: "WITHDRAWN",
      },
    });

    const disabledMemberships = beforeStudent.userId
      ? await tx.membership.updateMany({
          where: {
            tenantId: currentUser.tenantId,
            userId: beforeStudent.userId,
            role: {
              key: "STUDENT",
            },
          },
          data: {
            status: "DISABLED",
          },
        })
      : { count: 0 };

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "student.delete",
        entityType: "student",
        entityId: updatedStudent.id,
        beforeJson: toAuditSnapshot(beforeStudent),
        afterJson: {
          ...toAuditSnapshot(updatedStudent),
          disabledMembershipCount: disabledMemberships.count,
        },
      },
      tx,
    );

    return updatedStudent;
  });

  if (!student) {
    redirectWithStudentError("/dashboard/students", "not_found");
  }

  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${student.id}`);
  redirect("/dashboard/students?deleted=1");
}
