"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import {
  classGroupIdSchema,
  classGroupStudentIdSchema,
  getClassGroupFormValues,
  getClassGroupStudentFormValues,
  type ClassGroupFormValues,
} from "./class-group-schema";

function redirectWithClassGroupError(path: string, error: string): never {
  redirect(`${path}?error=${error}`);
}

function toClassGroupMutationData(values: ClassGroupFormValues) {
  return {
    name: values.name,
    courseProductId: values.courseProductId,
    primaryTeacherId: values.primaryTeacherId,
    campusId: values.campusId,
    capacity: values.capacity,
    status: values.status,
    startsAt: values.startsAt,
    endsAt: values.endsAt,
  };
}

function classGroupSnapshot(classGroup: {
  id: string;
  tenantId: string;
  courseProductId: string;
  primaryTeacherId: string;
  campusId: string;
  name: string;
  capacity: number;
  status: string;
  startsAt: Date;
  endsAt: Date;
}) {
  return {
    id: classGroup.id,
    tenantId: classGroup.tenantId,
    courseProductId: classGroup.courseProductId,
    primaryTeacherId: classGroup.primaryTeacherId,
    campusId: classGroup.campusId,
    name: classGroup.name,
    capacity: classGroup.capacity,
    status: classGroup.status,
    startsAt: classGroup.startsAt,
    endsAt: classGroup.endsAt,
  };
}

function classGroupStudentSnapshot(classGroupStudent: {
  id: string;
  tenantId: string;
  classGroupId: string;
  studentId: string;
}) {
  return {
    id: classGroupStudent.id,
    tenantId: classGroupStudent.tenantId,
    classGroupId: classGroupStudent.classGroupId,
    studentId: classGroupStudent.studentId,
  };
}

type ClassGroupConfigClient = {
  courseProduct: {
    findFirst(args: { where: { id: string; tenantId: string } }): Promise<unknown>;
  };
  teacherProfile: {
    findFirst(args: { where: { id: string; tenantId: string } }): Promise<unknown>;
  };
  campus: {
    findFirst(args: { where: { id: string; tenantId: string } }): Promise<unknown>;
  };
};

async function hasTenantScopedClassConfig(
  tx: ClassGroupConfigClient,
  tenantId: string,
  values: ClassGroupFormValues,
) {
  const [courseProduct, primaryTeacher, campus] = await Promise.all([
    tx.courseProduct.findFirst({
      where: {
        id: values.courseProductId,
        tenantId,
      },
    }),
    tx.teacherProfile.findFirst({
      where: {
        id: values.primaryTeacherId,
        tenantId,
      },
    }),
    tx.campus.findFirst({
      where: {
        id: values.campusId,
        tenantId,
      },
    }),
  ]);

  return Boolean(courseProduct && primaryTeacher && campus);
}

export async function createClassGroupAction(formData: FormData) {
  const currentUser = await requirePermission("classes:manage", {
    nextPath: "/dashboard/classes",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getClassGroupFormValues(formData);

  if (!parsed.success || parsed.data.status === "ARCHIVED") {
    redirectWithClassGroupError("/dashboard/classes", "invalid_input");
  }

  const classGroup = await prisma.$transaction(async (tx) => {
    const hasConfig = await hasTenantScopedClassConfig(tx, currentUser.tenantId, parsed.data);

    if (!hasConfig) {
      return null;
    }

    const createdClassGroup = await tx.classGroup.create({
      data: {
        tenantId: currentUser.tenantId,
        ...toClassGroupMutationData(parsed.data),
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "classGroup.create",
        entityType: "classGroup",
        entityId: createdClassGroup.id,
        afterJson: classGroupSnapshot(createdClassGroup),
      },
      tx,
    );

    return createdClassGroup;
  });

  if (!classGroup) {
    redirectWithClassGroupError("/dashboard/classes", "invalid_config");
  }

  revalidatePath("/dashboard/classes");
  redirect(`/dashboard/classes/${classGroup.id}`);
}

export async function updateClassGroupAction(formData: FormData) {
  const currentUser = await requirePermission("classes:manage", {
    nextPath: "/dashboard/classes",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedClassGroupId = classGroupIdSchema.safeParse(formData.get("classGroupId"));
  const parsed = getClassGroupFormValues(formData);

  if (!parsedClassGroupId.success || !parsed.success || parsed.data.status === "ARCHIVED") {
    redirectWithClassGroupError("/dashboard/classes", "invalid_input");
  }

  const classGroup = await prisma.$transaction(async (tx) => {
    const beforeClassGroup = await tx.classGroup.findFirst({
      where: {
        id: parsedClassGroupId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeClassGroup) {
      return null;
    }

    const hasConfig = await hasTenantScopedClassConfig(tx, currentUser.tenantId, parsed.data);

    if (!hasConfig) {
      return null;
    }

    const updatedClassGroup = await tx.classGroup.update({
      where: {
        id: beforeClassGroup.id,
      },
      data: toClassGroupMutationData(parsed.data),
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "classGroup.update",
        entityType: "classGroup",
        entityId: updatedClassGroup.id,
        beforeJson: classGroupSnapshot(beforeClassGroup),
        afterJson: classGroupSnapshot(updatedClassGroup),
      },
      tx,
    );

    return updatedClassGroup;
  });

  if (!classGroup) {
    redirectWithClassGroupError("/dashboard/classes", "not_found");
  }

  revalidatePath("/dashboard/classes");
  revalidatePath(`/dashboard/classes/${classGroup.id}`);
  redirect(`/dashboard/classes/${classGroup.id}`);
}

export async function addClassGroupStudentAction(formData: FormData) {
  const currentUser = await requirePermission("classes:manage", {
    nextPath: "/dashboard/classes",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getClassGroupStudentFormValues(formData);

  if (!parsed.success) {
    redirectWithClassGroupError("/dashboard/classes", "invalid_student");
  }

  const result = await prisma.$transaction(async (tx) => {
    const classGroup = await tx.classGroup.findFirst({
      where: {
        id: parsed.data.classGroupId,
        tenantId: currentUser.tenantId,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });
    const student = await tx.studentProfile.findFirst({
      where: {
        id: parsed.data.studentId,
        tenantId: currentUser.tenantId,
      },
    });

    if (!classGroup || !student) {
      return { status: "not_found" as const, classGroupId: parsed.data.classGroupId };
    }

    if (classGroup._count.students >= classGroup.capacity && !parsed.data.confirmCapacityOverride) {
      return { status: "capacity_warning" as const, classGroupId: classGroup.id };
    }

    const existingStudent = await tx.classGroupStudent.findFirst({
      where: {
        tenantId: currentUser.tenantId,
        classGroupId: classGroup.id,
        studentId: student.id,
      },
    });

    if (existingStudent) {
      return { status: "ok" as const, classGroupId: classGroup.id };
    }

    const createdClassGroupStudent = await tx.classGroupStudent.create({
      data: {
        tenantId: currentUser.tenantId,
        classGroupId: classGroup.id,
        studentId: student.id,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "classGroupStudent.add",
        entityType: "classGroupStudent",
        entityId: createdClassGroupStudent.id,
        afterJson: classGroupStudentSnapshot(createdClassGroupStudent),
      },
      tx,
    );

    return { status: "ok" as const, classGroupId: classGroup.id };
  });

  if (result.status === "capacity_warning") {
    redirectWithClassGroupError(`/dashboard/classes/${result.classGroupId}`, "capacity_warning");
  }

  if (result.status === "not_found") {
    redirectWithClassGroupError("/dashboard/classes", "not_found");
  }

  revalidatePath(`/dashboard/classes/${result.classGroupId}`);
  redirect(`/dashboard/classes/${result.classGroupId}`);
}

export async function removeClassGroupStudentAction(formData: FormData) {
  const currentUser = await requirePermission("classes:manage", {
    nextPath: "/dashboard/classes",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedClassGroupId = classGroupIdSchema.safeParse(formData.get("classGroupId"));
  const parsedClassGroupStudentId = classGroupStudentIdSchema.safeParse(
    formData.get("classGroupStudentId"),
  );

  if (!parsedClassGroupId.success || !parsedClassGroupStudentId.success) {
    redirectWithClassGroupError("/dashboard/classes", "invalid_student");
  }

  const removed = await prisma.$transaction(async (tx) => {
    const classGroupStudent = await tx.classGroupStudent.findFirst({
      where: {
        id: parsedClassGroupStudentId.data,
        classGroupId: parsedClassGroupId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!classGroupStudent) {
      return null;
    }

    const deletedClassGroupStudent = await tx.classGroupStudent.delete({
      where: {
        id: classGroupStudent.id,
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "classGroupStudent.remove",
        entityType: "classGroupStudent",
        entityId: deletedClassGroupStudent.id,
        beforeJson: classGroupStudentSnapshot(deletedClassGroupStudent),
      },
      tx,
    );

    return deletedClassGroupStudent;
  });

  if (!removed) {
    redirectWithClassGroupError(`/dashboard/classes/${parsedClassGroupId.data}`, "not_found");
  }

  revalidatePath(`/dashboard/classes/${parsedClassGroupId.data}`);
  redirect(`/dashboard/classes/${parsedClassGroupId.data}`);
}
