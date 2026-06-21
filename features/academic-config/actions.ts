"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import {
  getGradeConfigValues,
  getSubjectConfigValues,
  getTermConfigValues,
  gradeIdSchema,
  subjectIdSchema,
  termIdSchema,
} from "./config-schema";

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

export async function updateSubjectAction(formData: FormData) {
  const currentUser = await requirePermission("academicConfig:manage", {
    nextPath: "/dashboard/academic-config",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedSubjectId = subjectIdSchema.safeParse(formData.get("subjectId"));
  const parsed = getSubjectConfigValues(formData);

  if (!parsedSubjectId.success || !parsed.success) {
    redirectWithConfigError("invalid_subject");
  }

  const subject = await prisma.$transaction(async (tx) => {
    const beforeSubject = await tx.subject.findFirst({
      where: {
        id: parsedSubjectId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeSubject) {
      return null;
    }

    const updatedSubject = await tx.subject.update({
      where: {
        id: beforeSubject.id,
      },
      data: {
        name: parsed.data.name,
        code: parsed.data.code ?? null,
        status: parsed.data.status,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "subject.update",
        entityType: "subject",
        entityId: updatedSubject.id,
        beforeJson: beforeSubject,
        afterJson: updatedSubject,
      },
      tx,
    );

    return updatedSubject;
  });

  if (!subject) {
    redirectWithConfigError("not_found");
  }

  revalidatePath("/dashboard/academic-config");
  redirect("/dashboard/academic-config");
}

export async function deleteSubjectAction(formData: FormData) {
  const currentUser = await requirePermission("academicConfig:manage", {
    nextPath: "/dashboard/academic-config",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedSubjectId = subjectIdSchema.safeParse(formData.get("subjectId"));

  if (!parsedSubjectId.success) {
    redirectWithConfigError("invalid_subject");
  }

  const subject = await prisma.$transaction(async (tx) => {
    const beforeSubject = await tx.subject.findFirst({
      where: {
        id: parsedSubjectId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeSubject) {
      return null;
    }

    const deletedSubject = await tx.subject.update({
      where: {
        id: beforeSubject.id,
      },
      data: {
        status: "INACTIVE",
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "subject.delete",
        entityType: "subject",
        entityId: deletedSubject.id,
        beforeJson: beforeSubject,
        afterJson: deletedSubject,
      },
      tx,
    );

    return deletedSubject;
  });

  if (!subject) {
    redirectWithConfigError("not_found");
  }

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

export async function updateGradeAction(formData: FormData) {
  const currentUser = await requirePermission("academicConfig:manage", {
    nextPath: "/dashboard/academic-config",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedGradeId = gradeIdSchema.safeParse(formData.get("gradeId"));
  const parsed = getGradeConfigValues(formData);

  if (!parsedGradeId.success || !parsed.success) {
    redirectWithConfigError("invalid_grade");
  }

  const grade = await prisma.$transaction(async (tx) => {
    const beforeGrade = await tx.grade.findFirst({
      where: {
        id: parsedGradeId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeGrade) {
      return null;
    }

    const updatedGrade = await tx.grade.update({
      where: {
        id: beforeGrade.id,
      },
      data: {
        name: parsed.data.name,
        sortOrder: parsed.data.sortOrder,
        status: parsed.data.status,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "grade.update",
        entityType: "grade",
        entityId: updatedGrade.id,
        beforeJson: beforeGrade,
        afterJson: updatedGrade,
      },
      tx,
    );

    return updatedGrade;
  });

  if (!grade) {
    redirectWithConfigError("not_found");
  }

  revalidatePath("/dashboard/academic-config");
  redirect("/dashboard/academic-config");
}

export async function deleteGradeAction(formData: FormData) {
  const currentUser = await requirePermission("academicConfig:manage", {
    nextPath: "/dashboard/academic-config",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedGradeId = gradeIdSchema.safeParse(formData.get("gradeId"));

  if (!parsedGradeId.success) {
    redirectWithConfigError("invalid_grade");
  }

  const grade = await prisma.$transaction(async (tx) => {
    const beforeGrade = await tx.grade.findFirst({
      where: {
        id: parsedGradeId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeGrade) {
      return null;
    }

    const deletedGrade = await tx.grade.update({
      where: {
        id: beforeGrade.id,
      },
      data: {
        status: "INACTIVE",
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "grade.delete",
        entityType: "grade",
        entityId: deletedGrade.id,
        beforeJson: beforeGrade,
        afterJson: deletedGrade,
      },
      tx,
    );

    return deletedGrade;
  });

  if (!grade) {
    redirectWithConfigError("not_found");
  }

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

export async function updateTermAction(formData: FormData) {
  const currentUser = await requirePermission("academicConfig:manage", {
    nextPath: "/dashboard/academic-config",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedTermId = termIdSchema.safeParse(formData.get("termId"));
  const parsed = getTermConfigValues(formData);

  if (!parsedTermId.success || !parsed.success) {
    redirectWithConfigError("invalid_term");
  }

  const term = await prisma.$transaction(async (tx) => {
    const beforeTerm = await tx.term.findFirst({
      where: {
        id: parsedTermId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeTerm) {
      return null;
    }

    const updatedTerm = await tx.term.update({
      where: {
        id: beforeTerm.id,
      },
      data: {
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
        action: "term.update",
        entityType: "term",
        entityId: updatedTerm.id,
        beforeJson: beforeTerm,
        afterJson: updatedTerm,
      },
      tx,
    );

    return updatedTerm;
  });

  if (!term) {
    redirectWithConfigError("not_found");
  }

  revalidatePath("/dashboard/academic-config");
  redirect("/dashboard/academic-config");
}

export async function deleteTermAction(formData: FormData) {
  const currentUser = await requirePermission("academicConfig:manage", {
    nextPath: "/dashboard/academic-config",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedTermId = termIdSchema.safeParse(formData.get("termId"));

  if (!parsedTermId.success) {
    redirectWithConfigError("invalid_term");
  }

  const term = await prisma.$transaction(async (tx) => {
    const beforeTerm = await tx.term.findFirst({
      where: {
        id: parsedTermId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeTerm) {
      return null;
    }

    const deletedTerm = await tx.term.update({
      where: {
        id: beforeTerm.id,
      },
      data: {
        status: "INACTIVE",
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "term.delete",
        entityType: "term",
        entityId: deletedTerm.id,
        beforeJson: beforeTerm,
        afterJson: deletedTerm,
      },
      tx,
    );

    return deletedTerm;
  });

  if (!term) {
    redirectWithConfigError("not_found");
  }

  revalidatePath("/dashboard/academic-config");
  redirect("/dashboard/academic-config");
}
