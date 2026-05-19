"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import {
  courseProductIdSchema,
  getCourseProductFormValues,
  type CourseProductFormValues,
} from "./course-product-schema";

function redirectWithCourseProductError(path: string, error: string): never {
  redirect(`${path}?error=${error}`);
}

function toCourseProductMutationData(values: CourseProductFormValues) {
  return {
    name: values.name,
    subjectId: values.subjectId,
    gradeId: values.gradeId,
    courseType: values.courseType,
    classType: values.classType,
    totalHours: values.totalHours,
    price: values.price,
    description: values.description ?? null,
    status: values.status,
  };
}

function courseProductSnapshot(courseProduct: {
  id: string;
  tenantId: string;
  subjectId: string;
  gradeId: string;
  name: string;
  courseType: string;
  classType: string;
  totalHours: number;
  price: { toString(): string };
  description: string | null;
  status: string;
}) {
  return {
    id: courseProduct.id,
    tenantId: courseProduct.tenantId,
    subjectId: courseProduct.subjectId,
    gradeId: courseProduct.gradeId,
    name: courseProduct.name,
    courseType: courseProduct.courseType,
    classType: courseProduct.classType,
    totalHours: courseProduct.totalHours,
    price: courseProduct.price.toString(),
    description: courseProduct.description,
    status: courseProduct.status,
  };
}

type CourseProductConfigClient = {
  subject: {
    findFirst(args: { where: { id: string; tenantId: string } }): Promise<unknown>;
  };
  grade: {
    findFirst(args: { where: { id: string; tenantId: string } }): Promise<unknown>;
  };
};

async function hasTenantScopedConfig(
  tx: CourseProductConfigClient,
  tenantId: string,
  values: CourseProductFormValues,
) {
  const [subject, grade] = await Promise.all([
    tx.subject.findFirst({
      where: {
        id: values.subjectId,
        tenantId,
      },
    }),
    tx.grade.findFirst({
      where: {
        id: values.gradeId,
        tenantId,
      },
    }),
  ]);

  return Boolean(subject && grade);
}

export async function createCourseProductAction(formData: FormData) {
  const currentUser = await requirePermission("courses:manage", {
    nextPath: "/dashboard/courses",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getCourseProductFormValues(formData);

  if (!parsed.success || parsed.data.status === "ARCHIVED") {
    redirectWithCourseProductError("/dashboard/courses", "invalid_input");
  }

  const courseProduct = await prisma.$transaction(async (tx) => {
    const hasConfig = await hasTenantScopedConfig(tx, currentUser.tenantId, parsed.data);

    if (!hasConfig) {
      return null;
    }

    const createdCourseProduct = await tx.courseProduct.create({
      data: {
        tenantId: currentUser.tenantId,
        ...toCourseProductMutationData(parsed.data),
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "courseProduct.create",
        entityType: "courseProduct",
        entityId: createdCourseProduct.id,
        afterJson: courseProductSnapshot(createdCourseProduct),
      },
      tx,
    );

    return createdCourseProduct;
  });

  if (!courseProduct) {
    redirectWithCourseProductError("/dashboard/courses", "invalid_config");
  }

  revalidatePath("/dashboard/courses");
  redirect(`/dashboard/courses/${courseProduct.id}`);
}

export async function updateCourseProductAction(formData: FormData) {
  const currentUser = await requirePermission("courses:manage", {
    nextPath: "/dashboard/courses",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedCourseProductId = courseProductIdSchema.safeParse(formData.get("courseProductId"));
  const parsed = getCourseProductFormValues(formData);

  if (!parsedCourseProductId.success || !parsed.success || parsed.data.status === "ARCHIVED") {
    redirectWithCourseProductError("/dashboard/courses", "invalid_input");
  }

  const courseProduct = await prisma.$transaction(async (tx) => {
    const beforeCourseProduct = await tx.courseProduct.findFirst({
      where: {
        id: parsedCourseProductId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeCourseProduct) {
      return null;
    }

    const hasConfig = await hasTenantScopedConfig(tx, currentUser.tenantId, parsed.data);

    if (!hasConfig) {
      return null;
    }

    const updatedCourseProduct = await tx.courseProduct.update({
      where: {
        id: beforeCourseProduct.id,
      },
      data: toCourseProductMutationData(parsed.data),
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "courseProduct.update",
        entityType: "courseProduct",
        entityId: updatedCourseProduct.id,
        beforeJson: courseProductSnapshot(beforeCourseProduct),
        afterJson: courseProductSnapshot(updatedCourseProduct),
      },
      tx,
    );

    return updatedCourseProduct;
  });

  if (!courseProduct) {
    redirectWithCourseProductError("/dashboard/courses", "not_found");
  }

  revalidatePath("/dashboard/courses");
  revalidatePath(`/dashboard/courses/${courseProduct.id}`);
  redirect(`/dashboard/courses/${courseProduct.id}`);
}

export async function archiveCourseProductAction(formData: FormData) {
  const currentUser = await requirePermission("courses:manage", {
    nextPath: "/dashboard/courses",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedCourseProductId = courseProductIdSchema.safeParse(formData.get("courseProductId"));

  if (!parsedCourseProductId.success) {
    redirectWithCourseProductError("/dashboard/courses", "invalid_input");
  }

  const courseProduct = await prisma.$transaction(async (tx) => {
    const beforeCourseProduct = await tx.courseProduct.findFirst({
      where: {
        id: parsedCourseProductId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeCourseProduct) {
      return null;
    }

    const archivedCourseProduct = await tx.courseProduct.update({
      where: {
        id: beforeCourseProduct.id,
      },
      data: {
        status: "ARCHIVED",
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "courseProduct.archive",
        entityType: "courseProduct",
        entityId: archivedCourseProduct.id,
        beforeJson: courseProductSnapshot(beforeCourseProduct),
        afterJson: courseProductSnapshot(archivedCourseProduct),
      },
      tx,
    );

    return archivedCourseProduct;
  });

  if (!courseProduct) {
    redirectWithCourseProductError("/dashboard/courses", "not_found");
  }

  revalidatePath("/dashboard/courses");
  revalidatePath(`/dashboard/courses/${courseProduct.id}`);
  redirect("/dashboard/courses");
}
