"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { getGradeConfigValues, getSubjectConfigValues, getTermConfigValues } from "./config-schema";

function redirectWithConfigError(error: string): never {
  redirect(`/dashboard/academic-config?error=${error}`);
}

export async function createSubjectAction(formData: FormData) {
  const currentUser = await requirePermission("academicConfig:manage", {
    nextPath: "/dashboard/academic-config",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getSubjectConfigValues(formData);

  if (!parsed.success) {
    redirectWithConfigError("invalid_subject");
  }

  await prisma.$transaction(async (tx) => {
    const subject = await tx.subject.create({
      data: {
        tenantId: currentUser.tenantId,
        name: parsed.data.name,
        code: parsed.data.code ?? null,
        status: parsed.data.status,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "subject.create",
        entityType: "subject",
        entityId: subject.id,
        afterJson: subject,
      },
      tx,
    );
  });

  revalidatePath("/dashboard/academic-config");
  redirect("/dashboard/academic-config");
}

export async function createGradeAction(formData: FormData) {
  const currentUser = await requirePermission("academicConfig:manage", {
    nextPath: "/dashboard/academic-config",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getGradeConfigValues(formData);

  if (!parsed.success) {
    redirectWithConfigError("invalid_grade");
  }

  await prisma.$transaction(async (tx) => {
    const grade = await tx.grade.create({
      data: {
        tenantId: currentUser.tenantId,
        name: parsed.data.name,
        sortOrder: parsed.data.sortOrder,
        status: parsed.data.status,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "grade.create",
        entityType: "grade",
        entityId: grade.id,
        afterJson: grade,
      },
      tx,
    );
  });

  revalidatePath("/dashboard/academic-config");
  redirect("/dashboard/academic-config");
}

export async function createTermAction(formData: FormData) {
  const currentUser = await requirePermission("academicConfig:manage", {
    nextPath: "/dashboard/academic-config",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getTermConfigValues(formData);

  if (!parsed.success) {
    redirectWithConfigError("invalid_term");
  }

  await prisma.$transaction(async (tx) => {
    const term = await tx.term.create({
      data: {
        tenantId: currentUser.tenantId,
        name: parsed.data.name,
        startsAt: parsed.data.startsAt,
        endsAt: parsed.data.endsAt,
        status: parsed.data.status,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "term.create",
        entityType: "term",
        entityId: term.id,
        afterJson: term,
      },
      tx,
    );
  });

  revalidatePath("/dashboard/academic-config");
  redirect("/dashboard/academic-config");
}
