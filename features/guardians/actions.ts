"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { getGuardianBindingValues, type GuardianBindingValues } from "./guardian-schema";

function redirectWithGuardianError(studentId: string | null, error: string): never {
  const target = studentId ? `/dashboard/students/${studentId}` : "/dashboard/students";

  redirect(`${target}?error=${error}`);
}

function toGuardianSnapshot(input: {
  id: string;
  tenantId: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: string;
}) {
  return {
    id: input.id,
    tenantId: input.tenantId,
    name: input.name,
    phone: input.phone,
    email: input.email,
    status: input.status,
  };
}

function toStudentGuardianSnapshot(input: {
  id: string;
  tenantId: string;
  studentId: string;
  guardianId: string;
  relationship: string;
  isPrimary: boolean;
}) {
  return {
    id: input.id,
    tenantId: input.tenantId,
    studentId: input.studentId,
    guardianId: input.guardianId,
    relationship: input.relationship,
    isPrimary: input.isPrimary,
  };
}

function guardianCreateData(values: GuardianBindingValues, tenantId: string) {
  if (!values.name) {
    throw new Error("Guardian name is required.");
  }

  return {
    tenantId,
    name: values.name,
    phone: values.phone ?? null,
    email: values.email ?? null,
  };
}

export async function bindGuardianToStudentAction(formData: FormData) {
  const currentUser = await requirePermission("guardians:manage", {
    nextPath: "/dashboard/students",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getGuardianBindingValues(formData);

  if (!parsed.success) {
    redirectWithGuardianError(null, "invalid_guardian");
  }

  const binding = await prisma.$transaction(async (tx) => {
    const student = await tx.studentProfile.findFirst({
      where: {
        id: parsed.data.studentId,
        tenantId: currentUser.tenantId,
      },
    });

    if (!student) {
      return null;
    }

    const guardian = parsed.data.guardianId
      ? await tx.guardianProfile.findFirst({
          where: {
            id: parsed.data.guardianId,
            tenantId: currentUser.tenantId,
            status: "ACTIVE",
          },
        })
      : await tx.guardianProfile.create({
          data: guardianCreateData(parsed.data, currentUser.tenantId),
        });

    if (!guardian) {
      return null;
    }

    const studentGuardian = await tx.studentGuardian.create({
      data: {
        tenantId: currentUser.tenantId,
        studentId: student.id,
        guardianId: guardian.id,
        relationship: parsed.data.relationship,
        isPrimary: parsed.data.isPrimary,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "studentGuardian.bind",
        entityType: "studentGuardian",
        entityId: studentGuardian.id,
        afterJson: {
          guardian: toGuardianSnapshot(guardian),
          binding: toStudentGuardianSnapshot(studentGuardian),
        },
      },
      tx,
    );

    return studentGuardian;
  });

  if (!binding) {
    redirectWithGuardianError(parsed.data.studentId, "student_not_found");
  }

  revalidatePath(`/dashboard/students/${binding.studentId}`);
  redirect(`/dashboard/students/${binding.studentId}`);
}
