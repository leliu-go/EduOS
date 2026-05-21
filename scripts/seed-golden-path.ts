import "dotenv/config";

import type { Prisma } from "../lib/generated/prisma/client";
import { hashPassword } from "../lib/auth/password";
import { prisma } from "../lib/prisma";

type SeedTransaction = Prisma.TransactionClient;
type RoleKey = "ORG_ADMIN" | "ACADEMIC" | "FINANCE" | "TEACHER" | "STUDENT" | "PARENT";

const qaPassword = process.env.EDUOS_QA_PASSWORD ?? "EduOS-qa-123456";

const qaUsers: Array<{
  key: string;
  roleKey: RoleKey;
  name: string;
  email: string;
  phone: string;
}> = [
  {
    key: "admin",
    roleKey: "ORG_ADMIN",
    name: "QA Admin",
    email: "qa-admin@eduos.test",
    phone: "19900010001",
  },
  {
    key: "academic",
    roleKey: "ACADEMIC",
    name: "QA Academic",
    email: "qa-academic@eduos.test",
    phone: "19900010002",
  },
  {
    key: "finance",
    roleKey: "FINANCE",
    name: "QA Finance",
    email: "qa-finance@eduos.test",
    phone: "19900010003",
  },
  {
    key: "teacher",
    roleKey: "TEACHER",
    name: "QA Math Teacher",
    email: "qa-teacher-math@eduos.test",
    phone: "19900010004",
  },
  {
    key: "student",
    roleKey: "STUDENT",
    name: "QA Student 001",
    email: "qa-student-001@eduos.test",
    phone: "19900010005",
  },
  {
    key: "parent",
    roleKey: "PARENT",
    name: "QA Parent 001",
    email: "qa-parent-001@eduos.test",
    phone: "19900010006",
  },
];

const roleNames: Record<RoleKey, string> = {
  ORG_ADMIN: "QA Organization Admin",
  ACADEMIC: "QA Academic Affairs",
  FINANCE: "QA Finance",
  TEACHER: "QA Teacher",
  STUDENT: "QA Student",
  PARENT: "QA Parent",
};

function requireItem<T>(value: T | undefined, label: string): T {
  if (!value) {
    throw new Error(`Missing QA seed dependency: ${label}`);
  }

  return value;
}

async function upsertFirst<T>(
  find: () => Promise<T | null>,
  create: () => Promise<T>,
  update: (existing: T) => Promise<T>,
) {
  const existing = await find();

  return existing ? update(existing) : create();
}

async function seedGoldenPath() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed Day 5 golden-path data.");
  }

  if (process.env.EDUOS_ALLOW_GOLDEN_PATH_SEED !== "true") {
    throw new Error("Set EDUOS_ALLOW_GOLDEN_PATH_SEED=true before seeding QA golden-path data.");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run golden-path seed with NODE_ENV=production.");
  }

  const passwordHash = await hashPassword(qaPassword);

  return prisma.$transaction(async (tx: SeedTransaction) => {
    const tenant = await tx.tenant.upsert({
      where: { slug: "eduos-qa-academy" },
      create: {
        name: "EduOS QA Academy",
        slug: "eduos-qa-academy",
        status: "ACTIVE",
      },
      update: {
        name: "EduOS QA Academy",
        status: "ACTIVE",
      },
    });

    const campus = await tx.campus.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: "QA Jinan Campus",
        },
      },
      create: {
        tenantId: tenant.id,
        name: "QA Jinan Campus",
        address: "QA Test Road 100",
        businessHours: "09:00-21:00",
        status: "ACTIVE",
      },
      update: {
        address: "QA Test Road 100",
        businessHours: "09:00-21:00",
        status: "ACTIVE",
      },
    });

    const roles = new Map<RoleKey, { id: string }>();

    for (const roleKey of Object.keys(roleNames) as RoleKey[]) {
      const role = await tx.role.upsert({
        where: {
          tenantId_key: {
            tenantId: tenant.id,
            key: roleKey,
          },
        },
        create: {
          tenantId: tenant.id,
          key: roleKey,
          name: roleNames[roleKey],
          status: "ACTIVE",
        },
        update: {
          name: roleNames[roleKey],
          status: "ACTIVE",
        },
      });

      roles.set(roleKey, role);
    }

    const users = new Map<string, { id: string; email: string | null }>();

    for (const userSeed of qaUsers) {
      const user = await tx.user.upsert({
        where: { email: userSeed.email },
        create: {
          name: userSeed.name,
          email: userSeed.email,
          phone: userSeed.phone,
          passwordHash,
          status: "ACTIVE",
        },
        update: {
          name: userSeed.name,
          phone: userSeed.phone,
          passwordHash,
          status: "ACTIVE",
        },
      });
      const role = requireItem(roles.get(userSeed.roleKey), userSeed.roleKey);

      await tx.membership.upsert({
        where: {
          tenantId_userId_roleId_campusId: {
            tenantId: tenant.id,
            userId: user.id,
            roleId: role.id,
            campusId: campus.id,
          },
        },
        create: {
          tenantId: tenant.id,
          userId: user.id,
          roleId: role.id,
          campusId: campus.id,
          status: "ACTIVE",
        },
        update: {
          campusId: campus.id,
          status: "ACTIVE",
        },
      });

      users.set(userSeed.key, user);
    }

    const room = await tx.room.upsert({
      where: {
        tenantId_campusId_name: {
          tenantId: tenant.id,
          campusId: campus.id,
          name: "QA-101",
        },
      },
      create: {
        tenantId: tenant.id,
        campusId: campus.id,
        name: "QA-101",
        capacity: 12,
        equipment: "Whiteboard",
        status: "ACTIVE",
      },
      update: {
        capacity: 12,
        equipment: "Whiteboard",
        status: "ACTIVE",
      },
    });

    const teacherUser = requireItem(users.get("teacher"), "teacher user");
    const studentUser = requireItem(users.get("student"), "student user");
    const parentUser = requireItem(users.get("parent"), "parent user");
    const adminUser = requireItem(users.get("admin"), "admin user");

    const teacher = await tx.teacherProfile.upsert({
      where: {
        tenantId_phone: {
          tenantId: tenant.id,
          phone: "19900011001",
        },
      },
      create: {
        tenantId: tenant.id,
        userId: teacherUser.id,
        name: "QA Math Teacher",
        phone: "19900011001",
        email: "qa-teacher-math@eduos.test",
        subjects: ["Math"],
        grades: ["Grade 7"],
        availableTimeNotes: "QA weekday evenings",
        status: "ACTIVE",
      },
      update: {
        userId: teacherUser.id,
        name: "QA Math Teacher",
        email: "qa-teacher-math@eduos.test",
        subjects: ["Math"],
        grades: ["Grade 7"],
        availableTimeNotes: "QA weekday evenings",
        status: "ACTIVE",
      },
    });

    const student = await tx.studentProfile.upsert({
      where: {
        tenantId_userId: {
          tenantId: tenant.id,
          userId: studentUser.id,
        },
      },
      create: {
        tenantId: tenant.id,
        userId: studentUser.id,
        name: "QA Student 001",
        gender: "OTHER",
        birthday: new Date("2013-09-01T00:00:00.000Z"),
        grade: "Grade 7",
        school: "QA Test Middle School",
        notes: "QA_GOLDEN_PATH student profile",
        status: "ACTIVE",
      },
      update: {
        name: "QA Student 001",
        gender: "OTHER",
        birthday: new Date("2013-09-01T00:00:00.000Z"),
        grade: "Grade 7",
        school: "QA Test Middle School",
        notes: "QA_GOLDEN_PATH student profile",
        status: "ACTIVE",
      },
    });

    const guardian = await tx.guardianProfile.upsert({
      where: {
        tenantId_userId: {
          tenantId: tenant.id,
          userId: parentUser.id,
        },
      },
      create: {
        tenantId: tenant.id,
        userId: parentUser.id,
        name: "QA Parent 001",
        phone: "19900012001",
        email: "qa-parent-001@eduos.test",
        status: "ACTIVE",
      },
      update: {
        name: "QA Parent 001",
        phone: "19900012001",
        email: "qa-parent-001@eduos.test",
        status: "ACTIVE",
      },
    });

    await tx.studentGuardian.upsert({
      where: {
        tenantId_studentId_guardianId: {
          tenantId: tenant.id,
          studentId: student.id,
          guardianId: guardian.id,
        },
      },
      create: {
        tenantId: tenant.id,
        studentId: student.id,
        guardianId: guardian.id,
        relationship: "OTHER",
        isPrimary: true,
      },
      update: {
        relationship: "OTHER",
        isPrimary: true,
      },
    });

    const subject = await tx.subject.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: "Math",
        },
      },
      create: {
        tenantId: tenant.id,
        name: "Math",
        code: "QA_MATH",
        status: "ACTIVE",
      },
      update: {
        code: "QA_MATH",
        status: "ACTIVE",
      },
    });

    const grade = await tx.grade.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: "Grade 7",
        },
      },
      create: {
        tenantId: tenant.id,
        name: "Grade 7",
        sortOrder: 7,
        status: "ACTIVE",
      },
      update: {
        sortOrder: 7,
        status: "ACTIVE",
      },
    });

    const courseProduct = await tx.courseProduct.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: "QA Grade 7 Math Fall System Class",
        },
      },
      create: {
        tenantId: tenant.id,
        subjectId: subject.id,
        gradeId: grade.id,
        name: "QA Grade 7 Math Fall System Class",
        courseType: "SMALL_GROUP",
        classType: "OFFLINE",
        totalHours: 24,
        price: "1000",
        description: "QA_GOLDEN_PATH course product",
        status: "ACTIVE",
      },
      update: {
        subjectId: subject.id,
        gradeId: grade.id,
        courseType: "SMALL_GROUP",
        classType: "OFFLINE",
        totalHours: 24,
        price: "1000",
        description: "QA_GOLDEN_PATH course product",
        status: "ACTIVE",
      },
    });

    const classGroup = await tx.classGroup.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: "QA Grade 7 Math Class A",
        },
      },
      create: {
        tenantId: tenant.id,
        courseProductId: courseProduct.id,
        primaryTeacherId: teacher.id,
        campusId: campus.id,
        name: "QA Grade 7 Math Class A",
        capacity: 12,
        status: "ACTIVE",
        startsAt: new Date("2026-05-01T00:00:00.000Z"),
        endsAt: new Date("2026-08-31T23:59:59.000Z"),
      },
      update: {
        courseProductId: courseProduct.id,
        primaryTeacherId: teacher.id,
        campusId: campus.id,
        capacity: 12,
        status: "ACTIVE",
        startsAt: new Date("2026-05-01T00:00:00.000Z"),
        endsAt: new Date("2026-08-31T23:59:59.000Z"),
      },
    });

    await tx.classGroupStudent.upsert({
      where: {
        tenantId_classGroupId_studentId: {
          tenantId: tenant.id,
          classGroupId: classGroup.id,
          studentId: student.id,
        },
      },
      create: {
        tenantId: tenant.id,
        classGroupId: classGroup.id,
        studentId: student.id,
      },
      update: {},
    });

    const courseAccount = await tx.courseAccount.upsert({
      where: {
        tenantId_studentId_courseProductId: {
          tenantId: tenant.id,
          studentId: student.id,
          courseProductId: courseProduct.id,
        },
      },
      create: {
        tenantId: tenant.id,
        studentId: student.id,
        courseProductId: courseProduct.id,
        purchasedHours: 30,
        giftHours: 2,
        usedHours: 1,
        status: "ACTIVE",
      },
      update: {
        purchasedHours: 30,
        giftHours: 2,
        usedHours: 1,
        status: "ACTIVE",
      },
    });

    const order = await tx.order.upsert({
      where: {
        tenantId_orderNo: {
          tenantId: tenant.id,
          orderNo: "QA-ORDER-20260521-001",
        },
      },
      create: {
        tenantId: tenant.id,
        orderNo: "QA-ORDER-20260521-001",
        studentId: student.id,
        guardianId: guardian.id,
        courseProductId: courseProduct.id,
        totalAmount: "1000",
        payableAmount: "1000",
        status: "PAID",
        notes: "QA_GOLDEN_PATH signup order",
      },
      update: {
        studentId: student.id,
        guardianId: guardian.id,
        courseProductId: courseProduct.id,
        totalAmount: "1000",
        payableAmount: "1000",
        status: "PAID",
        notes: "QA_GOLDEN_PATH signup order",
      },
    });

    const payment = await upsertFirst(
      () =>
        tx.payment.findFirst({
          where: {
            tenantId: tenant.id,
            transactionNo: "QA-PAY-20260521-001",
          },
        }),
      () =>
        tx.payment.create({
          data: {
            tenantId: tenant.id,
            orderId: order.id,
            studentId: student.id,
            guardianId: guardian.id,
            amount: "1000",
            method: "WECHAT",
            status: "CONFIRMED",
            paidAt: new Date("2026-05-21T10:00:00.000Z"),
            transactionNo: "QA-PAY-20260521-001",
            notes: "QA_GOLDEN_PATH manual payment",
          },
        }),
      (existing) =>
        tx.payment.update({
          where: { id: existing.id },
          data: {
            orderId: order.id,
            studentId: student.id,
            guardianId: guardian.id,
            amount: "1000",
            method: "WECHAT",
            status: "CONFIRMED",
            paidAt: new Date("2026-05-21T10:00:00.000Z"),
            notes: "QA_GOLDEN_PATH manual payment",
          },
        }),
    );

    await upsertFirst(
      () =>
        tx.enrollment.findFirst({
          where: {
            tenantId: tenant.id,
            studentId: student.id,
            courseProductId: courseProduct.id,
            classGroupId: classGroup.id,
          },
        }),
      () =>
        tx.enrollment.create({
          data: {
            tenantId: tenant.id,
            studentId: student.id,
            courseProductId: courseProduct.id,
            classGroupId: classGroup.id,
            courseAccountId: courseAccount.id,
            orderId: order.id,
            purchasedHours: 24,
            status: "ACTIVE",
            enrolledAt: new Date("2026-05-21T10:10:00.000Z"),
            notes: "QA_GOLDEN_PATH enrollment",
          },
        }),
      (existing) =>
        tx.enrollment.update({
          where: { id: existing.id },
          data: {
            classGroupId: classGroup.id,
            courseAccountId: courseAccount.id,
            orderId: order.id,
            purchasedHours: 24,
            status: "ACTIVE",
            enrolledAt: new Date("2026-05-21T10:10:00.000Z"),
            notes: "QA_GOLDEN_PATH enrollment",
          },
        }),
    );

    const lessonOne = await upsertFirst(
      () =>
        tx.lesson.findFirst({
          where: {
            tenantId: tenant.id,
            classGroupId: classGroup.id,
            teacherId: teacher.id,
            title: "QA Rational Number Operations",
          },
        }),
      () =>
        tx.lesson.create({
          data: {
            tenantId: tenant.id,
            classGroupId: classGroup.id,
            teacherId: teacher.id,
            title: "QA Rational Number Operations",
            status: "SCHEDULED",
          },
        }),
      (existing) =>
        tx.lesson.update({
          where: { id: existing.id },
          data: { status: "SCHEDULED" },
        }),
    );

    const lessonTwo = await upsertFirst(
      () =>
        tx.lesson.findFirst({
          where: {
            tenantId: tenant.id,
            classGroupId: classGroup.id,
            teacherId: teacher.id,
            title: "QA Polynomial Addition",
          },
        }),
      () =>
        tx.lesson.create({
          data: {
            tenantId: tenant.id,
            classGroupId: classGroup.id,
            teacherId: teacher.id,
            title: "QA Polynomial Addition",
            status: "SCHEDULED",
          },
        }),
      (existing) =>
        tx.lesson.update({
          where: { id: existing.id },
          data: { status: "SCHEDULED" },
        }),
    );

    const scheduleOne = await upsertFirst(
      () =>
        tx.schedule.findFirst({
          where: {
            tenantId: tenant.id,
            classGroupId: classGroup.id,
            teacherId: teacher.id,
            roomId: room.id,
            startAt: new Date("2026-05-23T10:00:00.000Z"),
          },
        }),
      () =>
        tx.schedule.create({
          data: {
            tenantId: tenant.id,
            classGroupId: classGroup.id,
            teacherId: teacher.id,
            campusId: campus.id,
            roomId: room.id,
            lessonId: lessonOne.id,
            startAt: new Date("2026-05-23T10:00:00.000Z"),
            endAt: new Date("2026-05-23T12:00:00.000Z"),
            status: "SCHEDULED",
          },
        }),
      (existing) =>
        tx.schedule.update({
          where: { id: existing.id },
          data: {
            campusId: campus.id,
            lessonId: lessonOne.id,
            endAt: new Date("2026-05-23T12:00:00.000Z"),
            status: "SCHEDULED",
          },
        }),
    );

    await upsertFirst(
      () =>
        tx.schedule.findFirst({
          where: {
            tenantId: tenant.id,
            classGroupId: classGroup.id,
            teacherId: teacher.id,
            roomId: room.id,
            startAt: new Date("2026-05-30T10:00:00.000Z"),
          },
        }),
      () =>
        tx.schedule.create({
          data: {
            tenantId: tenant.id,
            classGroupId: classGroup.id,
            teacherId: teacher.id,
            campusId: campus.id,
            roomId: room.id,
            lessonId: lessonTwo.id,
            startAt: new Date("2026-05-30T10:00:00.000Z"),
            endAt: new Date("2026-05-30T12:00:00.000Z"),
            status: "SCHEDULED",
          },
        }),
      (existing) =>
        tx.schedule.update({
          where: { id: existing.id },
          data: {
            campusId: campus.id,
            lessonId: lessonTwo.id,
            endAt: new Date("2026-05-30T12:00:00.000Z"),
            status: "SCHEDULED",
          },
        }),
    );

    const attendance = await tx.attendance.upsert({
      where: {
        tenantId_scheduleId_studentId: {
          tenantId: tenant.id,
          scheduleId: scheduleOne.id,
          studentId: student.id,
        },
      },
      create: {
        tenantId: tenant.id,
        scheduleId: scheduleOne.id,
        studentId: student.id,
        status: "PRESENT",
        notes: "QA_GOLDEN_PATH attendance",
      },
      update: {
        status: "PRESENT",
        notes: "QA_GOLDEN_PATH attendance",
      },
    });

    await tx.checkIn.upsert({
      where: {
        tenantId_scheduleId_studentId: {
          tenantId: tenant.id,
          scheduleId: scheduleOne.id,
          studentId: student.id,
        },
      },
      create: {
        tenantId: tenant.id,
        scheduleId: scheduleOne.id,
        studentId: student.id,
        checkedInAt: new Date("2026-05-23T09:55:00.000Z"),
        confirmedAt: new Date("2026-05-23T10:05:00.000Z"),
        confirmedByUserId: teacherUser.id,
      },
      update: {
        checkedInAt: new Date("2026-05-23T09:55:00.000Z"),
        confirmedAt: new Date("2026-05-23T10:05:00.000Z"),
        confirmedByUserId: teacherUser.id,
      },
    });

    await tx.courseConsumption.upsert({
      where: {
        tenantId_scheduleId_studentId: {
          tenantId: tenant.id,
          scheduleId: scheduleOne.id,
          studentId: student.id,
        },
      },
      create: {
        tenantId: tenant.id,
        scheduleId: scheduleOne.id,
        attendanceId: attendance.id,
        studentId: student.id,
        courseProductId: courseProduct.id,
        courseAccountId: courseAccount.id,
        consumedHours: 1,
        reason: "QA_GOLDEN_PATH attendance consumption",
      },
      update: {
        attendanceId: attendance.id,
        courseProductId: courseProduct.id,
        courseAccountId: courseAccount.id,
        consumedHours: 1,
        reason: "QA_GOLDEN_PATH attendance consumption",
        reversedAt: null,
        reversalReason: null,
      },
    });

    const resource = await upsertFirst(
      () =>
        tx.resource.findFirst({
          where: {
            tenantId: tenant.id,
            title: "QA Test Handout PDF",
          },
        }),
      () =>
        tx.resource.create({
          data: {
            tenantId: tenant.id,
            title: "QA Test Handout PDF",
            description: "QA_GOLDEN_PATH handout resource",
            resourceType: "HANDOUT",
            status: "ACTIVE",
            provider: "local",
            bucket: "qa-local",
            objectKey: "qa-golden-path/handout.pdf",
            originalName: "qa-handout.pdf",
            fileName: "qa-handout.pdf",
            mimeType: "application/pdf",
            size: 128,
            checksum: "qa-golden-path-checksum",
            visibility: "PRIVATE",
            createdById: adminUser.id,
            releaseAt: new Date("2026-05-21T10:20:00.000Z"),
            courseProductId: courseProduct.id,
            classGroupId: classGroup.id,
            lessonId: lessonOne.id,
          },
        }),
      (existing) =>
        tx.resource.update({
          where: { id: existing.id },
          data: {
            description: "QA_GOLDEN_PATH handout resource",
            resourceType: "HANDOUT",
            status: "ACTIVE",
            provider: "local",
            bucket: "qa-local",
            objectKey: "qa-golden-path/handout.pdf",
            originalName: "qa-handout.pdf",
            fileName: "qa-handout.pdf",
            mimeType: "application/pdf",
            size: 128,
            checksum: "qa-golden-path-checksum",
            visibility: "PRIVATE",
            createdById: adminUser.id,
            releaseAt: new Date("2026-05-21T10:20:00.000Z"),
            courseProductId: courseProduct.id,
            classGroupId: classGroup.id,
            lessonId: lessonOne.id,
          },
        }),
    );

    await upsertFirst(
      () =>
        tx.resourcePermission.findFirst({
          where: {
            tenantId: tenant.id,
            resourceId: resource.id,
            target: "CLASS_GROUP",
            classGroupId: classGroup.id,
          },
        }),
      () =>
        tx.resourcePermission.create({
          data: {
            tenantId: tenant.id,
            resourceId: resource.id,
            target: "CLASS_GROUP",
            classGroupId: classGroup.id,
            canView: true,
          },
        }),
      (existing) =>
        tx.resourcePermission.update({
          where: { id: existing.id },
          data: { canView: true },
        }),
    );

    const homework = await upsertFirst(
      () =>
        tx.homework.findFirst({
          where: {
            tenantId: tenant.id,
            title: "QA Lesson 1 Practice",
          },
        }),
      () =>
        tx.homework.create({
          data: {
            tenantId: tenant.id,
            title: "QA Lesson 1 Practice",
            instructions: "Complete rational number exercises and submit text answers.",
            dueAt: new Date("2026-05-24T12:00:00.000Z"),
            status: "ASSIGNED",
            assignedByUserId: teacherUser.id,
            classGroupId: classGroup.id,
            lessonId: lessonOne.id,
          },
        }),
      (existing) =>
        tx.homework.update({
          where: { id: existing.id },
          data: {
            instructions: "Complete rational number exercises and submit text answers.",
            dueAt: new Date("2026-05-24T12:00:00.000Z"),
            status: "ASSIGNED",
            assignedByUserId: teacherUser.id,
            classGroupId: classGroup.id,
            lessonId: lessonOne.id,
          },
        }),
    );

    const submission = await tx.homeworkSubmission.upsert({
      where: {
        tenantId_homeworkId_studentId_attemptNumber: {
          tenantId: tenant.id,
          homeworkId: homework.id,
          studentId: student.id,
          attemptNumber: 1,
        },
      },
      create: {
        tenantId: tenant.id,
        homeworkId: homework.id,
        studentId: student.id,
        attemptNumber: 1,
        status: "PENDING_CORRECTION",
        contentText: "QA_GOLDEN_PATH homework submission",
        submittedAt: new Date("2026-05-23T16:00:00.000Z"),
      },
      update: {
        status: "PENDING_CORRECTION",
        contentText: "QA_GOLDEN_PATH homework submission",
        submittedAt: new Date("2026-05-23T16:00:00.000Z"),
      },
    });

    await upsertFirst(
      () =>
        tx.homeworkCorrection.findFirst({
          where: {
            tenantId: tenant.id,
            submissionId: submission.id,
          },
        }),
      () =>
        tx.homeworkCorrection.create({
          data: {
            tenantId: tenant.id,
            submissionId: submission.id,
            teacherId: teacher.id,
            status: "NEEDS_REVISION",
            score: 80,
            comment: "QA_GOLDEN_PATH correction comment",
            correctedAt: new Date("2026-05-23T18:00:00.000Z"),
          },
        }),
      (existing) =>
        tx.homeworkCorrection.update({
          where: { id: existing.id },
          data: {
            teacherId: teacher.id,
            status: "NEEDS_REVISION",
            score: 80,
            comment: "QA_GOLDEN_PATH correction comment",
            correctedAt: new Date("2026-05-23T18:00:00.000Z"),
          },
        }),
    );

    const activity = await upsertFirst(
      () =>
        tx.activity.findFirst({
          where: {
            tenantId: tenant.id,
            title: "QA 7 Day Word Checkin",
          },
        }),
      () =>
        tx.activity.create({
          data: {
            tenantId: tenant.id,
            title: "QA 7 Day Word Checkin",
            description: "QA_GOLDEN_PATH WORD_CHECKIN activity",
            type: "WORD_CHECKIN",
            status: "PUBLISHED",
            startsAt: new Date("2026-05-21T00:00:00.000Z"),
            endsAt: new Date("2026-05-28T23:59:59.000Z"),
            wordListResourceId: resource.id,
            targetWordCount: 20,
            dailyCheckInLimit: 1,
            instructions: "Read and check in 20 QA words.",
            createdById: adminUser.id,
            publishedAt: new Date("2026-05-21T10:30:00.000Z"),
          },
        }),
      (existing) =>
        tx.activity.update({
          where: { id: existing.id },
          data: {
            description: "QA_GOLDEN_PATH WORD_CHECKIN activity",
            status: "PUBLISHED",
            startsAt: new Date("2026-05-21T00:00:00.000Z"),
            endsAt: new Date("2026-05-28T23:59:59.000Z"),
            wordListResourceId: resource.id,
            targetWordCount: 20,
            dailyCheckInLimit: 1,
            instructions: "Read and check in 20 QA words.",
            createdById: adminUser.id,
            publishedAt: new Date("2026-05-21T10:30:00.000Z"),
          },
        }),
    );

    await upsertFirst(
      () =>
        tx.activityAssignment.findFirst({
          where: {
            tenantId: tenant.id,
            activityId: activity.id,
            targetType: "CLASS_GROUP",
            classGroupId: classGroup.id,
          },
        }),
      () =>
        tx.activityAssignment.create({
          data: {
            tenantId: tenant.id,
            activityId: activity.id,
            targetType: "CLASS_GROUP",
            classGroupId: classGroup.id,
            assignedById: adminUser.id,
          },
        }),
      (existing) =>
        tx.activityAssignment.update({
          where: { id: existing.id },
          data: { assignedById: adminUser.id },
        }),
    );

    await upsertFirst(
      () =>
        tx.activityCheckIn.findFirst({
          where: {
            tenantId: tenant.id,
            activityId: activity.id,
            studentId: student.id,
            checkInDate: new Date("2026-05-21T00:00:00.000Z"),
          },
        }),
      () =>
        tx.activityCheckIn.create({
          data: {
            tenantId: tenant.id,
            activityId: activity.id,
            studentId: student.id,
            studentUserId: studentUser.id,
            submittedById: studentUser.id,
            checkedWordCount: 20,
            note: "QA_GOLDEN_PATH activity check-in",
            checkInDate: new Date("2026-05-21T00:00:00.000Z"),
          },
        }),
      (existing) =>
        tx.activityCheckIn.update({
          where: { id: existing.id },
          data: {
            studentUserId: studentUser.id,
            submittedById: studentUser.id,
            checkedWordCount: 20,
            note: "QA_GOLDEN_PATH activity check-in",
          },
        }),
    );

    await upsertFirst(
      () =>
        tx.refund.findFirst({
          where: {
            tenantId: tenant.id,
            courseAccountId: courseAccount.id,
            reason: "QA_GOLDEN_PATH refund request",
          },
        }),
      () =>
        tx.refund.create({
          data: {
            tenantId: tenant.id,
            orderId: order.id,
            paymentId: payment.id,
            courseAccountId: courseAccount.id,
            studentId: student.id,
            guardianId: guardian.id,
            amount: "100",
            refundHours: 1,
            reason: "QA_GOLDEN_PATH refund request",
            approvalNote: "QA approval fixture",
            status: "APPROVED",
            requestedByUserId: adminUser.id,
            approvedByUserId: adminUser.id,
            approvedAt: new Date("2026-05-21T11:30:00.000Z"),
          },
        }),
      (existing) =>
        tx.refund.update({
          where: { id: existing.id },
          data: {
            orderId: order.id,
            paymentId: payment.id,
            courseAccountId: courseAccount.id,
            studentId: student.id,
            guardianId: guardian.id,
            amount: "100",
            refundHours: 1,
            approvalNote: "QA approval fixture",
            status: "APPROVED",
            requestedByUserId: adminUser.id,
            approvedByUserId: adminUser.id,
            approvedAt: new Date("2026-05-21T11:30:00.000Z"),
          },
        }),
    );

    await upsertFirst(
      () =>
        tx.auditLog.findFirst({
          where: {
            tenantId: tenant.id,
            action: "QA_GOLDEN_PATH_SEEDED",
            entityType: "Tenant",
            entityId: tenant.id,
          },
        }),
      () =>
        tx.auditLog.create({
          data: {
            tenantId: tenant.id,
            actorUserId: adminUser.id,
            action: "QA_GOLDEN_PATH_SEEDED",
            entityType: "Tenant",
            entityId: tenant.id,
            afterJson: {
              tenantSlug: tenant.slug,
              seededAt: "2026-05-21",
            },
            reason: "Day 5 local QA golden-path seed",
          },
        }),
      (existing) =>
        tx.auditLog.update({
          where: { id: existing.id },
          data: {
            actorUserId: adminUser.id,
            afterJson: {
              tenantSlug: tenant.slug,
              seededAt: "2026-05-21",
            },
            reason: "Day 5 local QA golden-path seed",
          },
        }),
    );

    return {
      tenantSlug: tenant.slug,
      userCount: qaUsers.length,
      className: classGroup.name,
      resourceTitle: resource.title,
      activityTitle: activity.title,
    };
  });
}

async function main() {
  const result = await seedGoldenPath();

  console.log(
    `Seeded ${result.tenantSlug} with ${result.userCount} QA users, ` +
      `${result.className}, ${result.resourceTitle}, and ${result.activityTitle}.`,
  );
  console.log("QA accounts use EDUOS_QA_PASSWORD or the documented local QA default.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
