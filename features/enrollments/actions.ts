"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import { getEnrollmentFormValues, type EnrollmentFormValues } from "./enrollment-schema";

function redirectWithEnrollmentError(error: string): never {
  redirect(`/dashboard/enrollments?error=${error}`);
}

function enrollmentSnapshot(enrollment: {
  id: string;
  tenantId: string;
  studentId: string;
  courseProductId: string;
  classGroupId: string | null;
  courseAccountId: string;
  purchasedHours: number;
  status: string;
  enrolledAt: Date;
  notes: string | null;
}) {
  return {
    id: enrollment.id,
    tenantId: enrollment.tenantId,
    studentId: enrollment.studentId,
    courseProductId: enrollment.courseProductId,
    classGroupId: enrollment.classGroupId,
    courseAccountId: enrollment.courseAccountId,
    purchasedHours: enrollment.purchasedHours,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    notes: enrollment.notes,
  };
}

function courseAccountSnapshot(courseAccount: {
  id: string;
  tenantId: string;
  studentId: string;
  courseProductId: string;
  purchasedHours: number;
  giftHours: number;
  usedHours: number;
  frozenHours: number;
  status: string;
}) {
  return {
    id: courseAccount.id,
    tenantId: courseAccount.tenantId,
    studentId: courseAccount.studentId,
    courseProductId: courseAccount.courseProductId,
    purchasedHours: courseAccount.purchasedHours,
    giftHours: courseAccount.giftHours,
    usedHours: courseAccount.usedHours,
    frozenHours: courseAccount.frozenHours,
    status: courseAccount.status,
  };
}

async function getEnrollmentScope(
  tx: {
    studentProfile: {
      findFirst(args: { where: { id: string; tenantId: string } }): Promise<{ id: string } | null>;
    };
    courseProduct: {
      findFirst(args: { where: { id: string; tenantId: string } }): Promise<{ id: string } | null>;
    };
    classGroup: {
      findFirst(args: {
        where: { id: string; tenantId: string; courseProductId: string };
      }): Promise<{ id: string } | null>;
    };
  },
  tenantId: string,
  values: EnrollmentFormValues,
) {
  const [student, courseProduct, classGroup] = await Promise.all([
    tx.studentProfile.findFirst({
      where: {
        id: values.studentId,
        tenantId,
      },
    }),
    tx.courseProduct.findFirst({
      where: {
        id: values.courseProductId,
        tenantId,
      },
    }),
    values.classGroupId
      ? tx.classGroup.findFirst({
          where: {
            id: values.classGroupId,
            tenantId,
            courseProductId: values.courseProductId,
          },
        })
      : Promise.resolve(null),
  ]);

  return {
    student,
    courseProduct,
    classGroup,
  };
}

export async function createEnrollmentAction(formData: FormData) {
  const currentUser = await requirePermission("enrollments:manage", {
    nextPath: "/dashboard/enrollments",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getEnrollmentFormValues(formData);

  if (!parsed.success) {
    redirectWithEnrollmentError("invalid_input");
  }

  const result = await prisma.$transaction(async (tx) => {
    const scope = await getEnrollmentScope(tx, currentUser.tenantId, parsed.data);

    if (!scope.student || !scope.courseProduct || (parsed.data.classGroupId && !scope.classGroup)) {
      return null;
    }

    const courseAccount = await tx.courseAccount.upsert({
      where: {
        tenantId_studentId_courseProductId: {
          tenantId: currentUser.tenantId,
          studentId: scope.student.id,
          courseProductId: scope.courseProduct.id,
        },
      },
      create: {
        tenantId: currentUser.tenantId,
        studentId: scope.student.id,
        courseProductId: scope.courseProduct.id,
        purchasedHours: parsed.data.purchasedHours,
      },
      update: {
        purchasedHours: {
          increment: parsed.data.purchasedHours,
        },
      },
    });

    const enrollment = await tx.enrollment.create({
      data: {
        tenantId: currentUser.tenantId,
        studentId: scope.student.id,
        courseProductId: scope.courseProduct.id,
        classGroupId: scope.classGroup?.id ?? null,
        courseAccountId: courseAccount.id,
        purchasedHours: parsed.data.purchasedHours,
        enrolledAt: parsed.data.enrolledAt,
        notes: parsed.data.notes ?? null,
      },
    });

    if (scope.classGroup) {
      const existingClassGroupStudent = await tx.classGroupStudent.findFirst({
        where: {
          tenantId: currentUser.tenantId,
          classGroupId: scope.classGroup.id,
          studentId: scope.student.id,
        },
      });

      if (!existingClassGroupStudent) {
        await tx.classGroupStudent.create({
          data: {
            tenantId: currentUser.tenantId,
            classGroupId: scope.classGroup.id,
            studentId: scope.student.id,
          },
        });
      }
    }

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "enrollment.create",
        entityType: "enrollment",
        entityId: enrollment.id,
        afterJson: enrollmentSnapshot(enrollment),
      },
      tx,
    );
    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "courseAccount.upsert",
        entityType: "courseAccount",
        entityId: courseAccount.id,
        afterJson: courseAccountSnapshot(courseAccount),
      },
      tx,
    );

    return enrollment;
  });

  if (!result) {
    redirectWithEnrollmentError("invalid_scope");
  }

  revalidatePath("/dashboard/enrollments");
  revalidatePath("/student");
  redirect("/dashboard/enrollments");
}
