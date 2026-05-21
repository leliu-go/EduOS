"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import {
  getResourceFormValues,
  getResourceReleaseValues,
  type ResourceFormValues,
} from "./resource-schema";

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
  releaseAt: Date | null;
  provider?: string | null;
  bucket?: string | null;
  objectKey?: string | null;
  originalName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  checksum?: string | null;
  visibility?: string;
  createdById?: string | null;
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
    provider: input.provider ?? null,
    bucket: input.bucket ?? null,
    objectKey: input.objectKey ?? null,
    originalName: input.originalName ?? null,
    mimeType: input.mimeType ?? null,
    size: input.size ?? null,
    checksum: input.checksum ?? null,
    visibility: input.visibility ?? "PRIVATE",
    createdById: input.createdById ?? null,
    releaseAt: input.releaseAt,
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

function getManageableResourceWhere(currentUser: ResourceActor, resourceId: string) {
  const teacherScope: Prisma.ResourceWhereInput =
    currentUser.roleKey === "TEACHER"
      ? {
          OR: [
            {
              courseProduct: {
                classGroups: {
                  some: {
                    primaryTeacher: {
                      userId: currentUser.id,
                    },
                  },
                },
              },
            },
            {
              classGroup: {
                primaryTeacher: {
                  userId: currentUser.id,
                },
              },
            },
            {
              lesson: {
                teacher: {
                  userId: currentUser.id,
                },
              },
            },
          ],
        }
      : {};

  return {
    id: resourceId,
    tenantId: currentUser.tenantId,
    ...teacherScope,
  } satisfies Prisma.ResourceWhereInput;
}

function revalidateResourcePaths(returnTo: string, lessonId?: string | null) {
  revalidatePath("/dashboard/resources");
  revalidatePath("/teacher/resources");
  revalidatePath("/student/resources");

  if (lessonId) {
    revalidatePath(`/teacher/lessons/${lessonId}`);
    revalidatePath(`/student/lessons/${lessonId}/resources`);
  }

  if (returnTo.startsWith("/teacher/lessons/")) {
    revalidatePath(returnTo);
  }
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
        createdById: currentUser.id,
        releaseAt: parsed.data.releaseAt ?? null,
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

  revalidateResourcePaths(returnTo, resource.lessonId);
  redirect(`${returnTo}?resource=created`);
}

export async function updateResourceReleaseAction(formData: FormData) {
  const parsed = getResourceReleaseValues(formData);
  const returnTo = parsed.success ? parsed.data.returnTo : "/dashboard/resources";
  const currentUser = await requirePermission("resources:manage", {
    nextPath: returnTo,
    unauthorizedRedirectTo: "/unauthorized",
  });

  if (!parsed.success) {
    redirectWithResourceError(returnTo, "invalid_release");
  }

  const updatedResource = await prisma.$transaction(async (tx) => {
    const existingResource = await tx.resource.findFirst({
      where: getManageableResourceWhere(currentUser, parsed.data.resourceId),
      select: {
        id: true,
        tenantId: true,
        title: true,
        resourceType: true,
        fileName: true,
        fileUrl: true,
        provider: true,
        bucket: true,
        objectKey: true,
        originalName: true,
        mimeType: true,
        size: true,
        checksum: true,
        visibility: true,
        createdById: true,
        releaseAt: true,
        courseProductId: true,
        classGroupId: true,
        lessonId: true,
      },
    });

    if (!existingResource) {
      return null;
    }

    const resource = await tx.resource.update({
      where: {
        id: existingResource.id,
      },
      data: {
        releaseAt: parsed.data.releaseAt ?? null,
      },
      select: {
        id: true,
        tenantId: true,
        title: true,
        resourceType: true,
        fileName: true,
        fileUrl: true,
        provider: true,
        bucket: true,
        objectKey: true,
        originalName: true,
        mimeType: true,
        size: true,
        checksum: true,
        visibility: true,
        createdById: true,
        releaseAt: true,
        courseProductId: true,
        classGroupId: true,
        lessonId: true,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "resource.release.update",
        entityType: "resource",
        entityId: resource.id,
        beforeJson: resourceSnapshot(existingResource),
        afterJson: resourceSnapshot(resource),
      },
      tx,
    );

    return resource;
  });

  if (!updatedResource) {
    redirectWithResourceError(returnTo, "invalid_resource");
  }

  revalidateResourcePaths(returnTo, updatedResource.lessonId);
  redirect(`${returnTo}?resource=release_updated`);
}
