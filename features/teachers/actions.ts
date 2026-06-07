"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { getTeacherFormValues, teacherIdSchema, type TeacherFormValues } from "./teacher-schema";

function redirectWithTeacherError(path: string, error: string): never {
  redirect(`${path}?error=${error}`);
}

function toTeacherMutationData(values: TeacherFormValues) {
  return {
    name: values.name,
    phone: values.phone,
    email: values.email ?? null,
    subjects: values.subjects,
    grades: values.grades,
    status: values.status,
    availableTimeNotes: values.availableTimeNotes ?? null,
    qualificationFileName: values.qualificationFileName ?? null,
    notes: values.notes ?? null,
  };
}

function toAuditSnapshot(teacher: {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string | null;
  subjects: string[];
  grades: string[];
  status: string;
  availableTimeNotes: string | null;
  qualificationFileName: string | null;
  notes: string | null;
}) {
  return {
    id: teacher.id,
    tenantId: teacher.tenantId,
    name: teacher.name,
    phone: teacher.phone,
    email: teacher.email,
    subjects: teacher.subjects,
    grades: teacher.grades,
    status: teacher.status,
    availableTimeNotes: teacher.availableTimeNotes,
    qualificationFileName: teacher.qualificationFileName,
    notes: teacher.notes,
  };
}

export async function createTeacherAction(formData: FormData) {
  const currentUser = await requirePermission("teachers:manage", {
    nextPath: "/dashboard/teachers",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getTeacherFormValues(formData);

  if (!parsed.success) {
    redirectWithTeacherError("/dashboard/teachers", "invalid_input");
  }

  const teacher = await prisma.$transaction(async (tx) => {
    const createdTeacher = await tx.teacherProfile.create({
      data: {
        tenantId: currentUser.tenantId,
        ...toTeacherMutationData(parsed.data),
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "teacher.create",
        entityType: "teacher",
        entityId: createdTeacher.id,
        afterJson: toAuditSnapshot(createdTeacher),
      },
      tx,
    );

    return createdTeacher;
  });

  revalidatePath("/dashboard/teachers");
  redirect(`/dashboard/teachers/${teacher.id}`);
}

export async function updateTeacherAction(formData: FormData) {
  const currentUser = await requirePermission("teachers:manage", {
    nextPath: "/dashboard/teachers",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedTeacherId = teacherIdSchema.safeParse(formData.get("teacherId"));
  const parsed = getTeacherFormValues(formData);

  if (!parsedTeacherId.success || !parsed.success) {
    redirectWithTeacherError("/dashboard/teachers", "invalid_input");
  }

  const teacher = await prisma.$transaction(async (tx) => {
    const beforeTeacher = await tx.teacherProfile.findFirst({
      where: {
        id: parsedTeacherId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeTeacher) {
      return null;
    }

    const updatedTeacher = await tx.teacherProfile.update({
      where: {
        id: beforeTeacher.id,
      },
      data: toTeacherMutationData(parsed.data),
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "teacher.update",
        entityType: "teacher",
        entityId: updatedTeacher.id,
        beforeJson: toAuditSnapshot(beforeTeacher),
        afterJson: toAuditSnapshot(updatedTeacher),
      },
      tx,
    );

    return updatedTeacher;
  });

  if (!teacher) {
    redirectWithTeacherError("/dashboard/teachers", "not_found");
  }

  revalidatePath("/dashboard/teachers");
  revalidatePath(`/dashboard/teachers/${teacher.id}`);
  redirect(`/dashboard/teachers/${teacher.id}`);
}

export async function deleteTeacherAction(formData: FormData) {
  const currentUser = await requirePermission("teachers:manage", {
    nextPath: "/dashboard/teachers",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedTeacherId = teacherIdSchema.safeParse(formData.get("teacherId"));

  if (!parsedTeacherId.success) {
    redirectWithTeacherError("/dashboard/teachers", "invalid_input");
  }

  const teacher = await prisma.$transaction(async (tx) => {
    const beforeTeacher = await tx.teacherProfile.findFirst({
      where: {
        id: parsedTeacherId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeTeacher) {
      return null;
    }

    const updatedTeacher = await tx.teacherProfile.update({
      where: {
        id: beforeTeacher.id,
      },
      data: {
        status: "RESIGNED",
      },
    });

    const disabledMemberships = beforeTeacher.userId
      ? await tx.membership.updateMany({
          where: {
            tenantId: currentUser.tenantId,
            userId: beforeTeacher.userId,
            role: {
              key: "TEACHER",
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
        action: "teacher.delete",
        entityType: "teacher",
        entityId: updatedTeacher.id,
        beforeJson: toAuditSnapshot(beforeTeacher),
        afterJson: {
          ...toAuditSnapshot(updatedTeacher),
          disabledMembershipCount: disabledMemberships.count,
        },
      },
      tx,
    );

    return updatedTeacher;
  });

  if (!teacher) {
    redirectWithTeacherError("/dashboard/teachers", "not_found");
  }

  revalidatePath("/dashboard/teachers");
  revalidatePath(`/dashboard/teachers/${teacher.id}`);
  redirect("/dashboard/teachers?deleted=1");
}
