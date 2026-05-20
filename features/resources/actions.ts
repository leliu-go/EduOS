"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { getResourceFormValues, type ResourceFormValues } from "./resource-schema";

type ResourceActor = {
  id: string;
  tenantId: string;
  roleKey: string;
};

function redirectWithResourceError(returnTo: string, error: string): never {
  redirect(`${returnTo}?error=${error}`);
}

function resourceSnapshot(input: {
  id: string;
  tenantId: string;
  title: string;
  resourceType: string;
  fileName: string | null;
  fileUrl: string | null;
  courseProductId: string | null;
  classGroupId: string | null;
  lessonId: string | null;
}) {
  return {
    id: input.id,
    tenantId: input.tenantId,
    title: input.title,
    resourceType: input.resourceType,
    fileName: input.fileName,
    fileUrl: input.fileUrl,
    courseProductId: input.courseProductId,
    classGroupId: input.classGroupId,
    lessonId: input.lessonId,
  };
}

async function canUseResourceBinding(
  tx: Prisma.TransactionClient,
  currentUser: ResourceActor,
  values: ResourceFormValues,
) {
  const isTeacher = currentUser.roleKey === "TEACHER";

  const [courseProduct, classGroup, lesson] = await Promise.all([
    values.courseProductId
      ? tx.courseProduct.findFirst({
          where: {
            id: values.courseProductId,
            tenantId: currentUser.tenantId,
            ...(isTeacher
              ? {
                  classGroups: {
                    some: {
                      primaryTeacher: {
                        userId: currentUser.id,
                      },
                    },
                  },
                }
              : {}),
          },
          select: {
            id: true,
          },
        })
      : true,
    values.classGroupId
      ? tx.classGroup.findFirst({
          where: {
            id: values.classGroupId,
            tenantId: currentUser.tenantId,
            ...(isTeacher
              ? {
                  primaryTeacher: {
                    userId: currentUser.id,
                  },
                }
              : {}),
          },
          select: {
            id: true,
          },
        })
      : true,
    values.lessonId
      ? tx.lesson.findFirst({
          where: {
            id: values.lessonId,
            tenantId: currentUser.tenantId,
            ...(isTeacher
              ? {
                  teacher: {
                    userId: currentUser.id,
                  },
                }
              : {}),
          },
          select: {
            id: true,
          },
        })
      : true,
  ]);

  return Boolean(courseProduct && classGroup && lesson);
}

export async function createResourceMetadataAction(formData: FormData) {
  const parsed = getResourceFormValues(formData);
  const returnTo = parsed.success ? parsed.data.returnTo : "/dashboard/resources";
  const currentUser = await requirePermission("resources:manage", {
    nextPath: returnTo,
    unauthorizedRedirectTo: "/unauthorized",
  });

  if (!parsed.success) {
    redirectWithResourceError(returnTo, "invalid_input");
  }

  const resource = await prisma.$transaction(async (tx) => {
    const hasValidBinding = await canUseResourceBinding(tx, currentUser, parsed.data);

    if (!hasValidBinding) {
      return null;
    }

    const createdResource = await tx.resource.create({
      data: {
        tenantId: currentUser.tenantId,
        title: parsed.data.title,
        resourceType: parsed.data.resourceType,
        description: parsed.data.description ?? null,
        fileName: parsed.data.fileName ?? null,
        fileUrl: parsed.data.fileUrl ?? null,
        courseProductId: parsed.data.courseProductId ?? null,
        classGroupId: parsed.data.classGroupId ?? null,
        lessonId: parsed.data.lessonId ?? null,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "resource.create",
        entityType: "resource",
        entityId: createdResource.id,
        afterJson: resourceSnapshot(createdResource),
      },
      tx,
    );

    return createdResource;
  });

  if (!resource) {
    redirectWithResourceError(returnTo, "invalid_binding");
  }

  revalidatePath("/dashboard/resources");
  revalidatePath("/teacher/resources");
  redirect(`${returnTo}?resource=created`);
}
