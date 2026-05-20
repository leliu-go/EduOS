import type { Prisma } from "../lib/generated/prisma/client";
import { hashPassword } from "../lib/auth/password";
import { prisma } from "../lib/prisma";

import { demoSeedConfig, demoUserPassword } from "./demo-seed-data";

type SeedTransaction = Prisma.TransactionClient;
type MapValue<TMap> = TMap extends Map<string, infer TValue> ? TValue : never;

function requireFromMap<TMap extends Map<string, unknown>>(map: TMap, key: string) {
  const value = map.get(key) as MapValue<TMap> | undefined;

  if (!value) {
    throw new Error(`Missing demo seed dependency: ${key}`);
  }

  return value;
}

async function upsertLesson(
  tx: SeedTransaction,
  input: {
    tenantId: string;
    classGroupId: string;
    teacherId: string;
    title: string;
    status: "PLANNED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  },
) {
  const existingLesson = await tx.lesson.findFirst({
    where: {
      tenantId: input.tenantId,
      classGroupId: input.classGroupId,
      teacherId: input.teacherId,
      title: input.title,
    },
  });

  if (existingLesson) {
    return tx.lesson.update({
      where: {
        id: existingLesson.id,
      },
      data: {
        status: input.status,
      },
    });
  }

  return tx.lesson.create({
    data: input,
  });
}

async function upsertSchedule(
  tx: SeedTransaction,
  input: {
    tenantId: string;
    classGroupId: string;
    teacherId: string;
    campusId: string;
    roomId: string;
    lessonId: string;
    startAt: Date;
    endAt: Date;
    status: "SCHEDULED" | "RESCHEDULED" | "CANCELLED" | "COMPLETED" | "MAKE_UP";
  },
) {
  const existingSchedule = await tx.schedule.findFirst({
    where: {
      tenantId: input.tenantId,
      classGroupId: input.classGroupId,
      teacherId: input.teacherId,
      roomId: input.roomId,
      startAt: input.startAt,
      endAt: input.endAt,
    },
  });

  if (existingSchedule) {
    return tx.schedule.update({
      where: {
        id: existingSchedule.id,
      },
      data: {
        campusId: input.campusId,
        lessonId: input.lessonId,
        status: input.status,
      },
    });
  }

  return tx.schedule.create({
    data: input,
  });
}

async function seedDemoData() {
  const passwordHash = await hashPassword(demoUserPassword);

  return prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.upsert({
      where: {
        slug: demoSeedConfig.tenant.slug,
      },
      create: {
        ...demoSeedConfig.tenant,
        status: "ACTIVE",
      },
      update: {
        name: demoSeedConfig.tenant.name,
        status: "ACTIVE",
      },
    });
    const campus = await tx.campus.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: demoSeedConfig.campus.name,
        },
      },
      create: {
        tenantId: tenant.id,
        ...demoSeedConfig.campus,
        status: "ACTIVE",
      },
      update: {
        address: demoSeedConfig.campus.address,
        businessHours: demoSeedConfig.campus.businessHours,
        status: "ACTIVE",
      },
    });
    const rolesByKey = new Map<string, { id: string }>();

    for (const roleSeed of demoSeedConfig.roles) {
      const role = await tx.role.upsert({
        where: {
          tenantId_key: {
            tenantId: tenant.id,
            key: roleSeed.key,
          },
        },
        create: {
          tenantId: tenant.id,
          key: roleSeed.key,
          name: roleSeed.name,
          status: "ACTIVE",
        },
        update: {
          name: roleSeed.name,
          status: "ACTIVE",
        },
      });

      rolesByKey.set(role.key, role);
    }

    const usersByKey = new Map<string, { id: string; email: string | null }>();

    for (const userSeed of demoSeedConfig.users) {
      const user = await tx.user.upsert({
        where: {
          email: userSeed.email,
        },
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
      const role = requireFromMap(rolesByKey, userSeed.roleKey);

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

      usersByKey.set(userSeed.key, user);
    }

    const roomsByKey = new Map<string, { id: string }>();

    for (const roomSeed of demoSeedConfig.rooms) {
      const room = await tx.room.upsert({
        where: {
          tenantId_campusId_name: {
            tenantId: tenant.id,
            campusId: campus.id,
            name: roomSeed.name,
          },
        },
        create: {
          tenantId: tenant.id,
          campusId: campus.id,
          name: roomSeed.name,
          capacity: roomSeed.capacity,
          equipment: roomSeed.equipment,
          status: "ACTIVE",
        },
        update: {
          capacity: roomSeed.capacity,
          equipment: roomSeed.equipment,
          status: "ACTIVE",
        },
      });

      roomsByKey.set(roomSeed.key, room);
    }

    const teachersByKey = new Map<string, { id: string }>();

    for (const teacherSeed of demoSeedConfig.teachers) {
      const user = requireFromMap(usersByKey, teacherSeed.userKey);
      const teacher = await tx.teacherProfile.upsert({
        where: {
          tenantId_phone: {
            tenantId: tenant.id,
            phone: teacherSeed.phone,
          },
        },
        create: {
          tenantId: tenant.id,
          userId: user.id,
          name: teacherSeed.name,
          phone: teacherSeed.phone,
          email: teacherSeed.email,
          subjects: [...teacherSeed.subjects],
          grades: [...teacherSeed.grades],
          availableTimeNotes: teacherSeed.availableTimeNotes,
          status: "ACTIVE",
        },
        update: {
          userId: user.id,
          name: teacherSeed.name,
          email: teacherSeed.email,
          subjects: [...teacherSeed.subjects],
          grades: [...teacherSeed.grades],
          availableTimeNotes: teacherSeed.availableTimeNotes,
          status: "ACTIVE",
        },
      });

      teachersByKey.set(teacherSeed.key, teacher);
    }

    const studentsByKey = new Map<string, { id: string }>();

    for (const studentSeed of demoSeedConfig.students) {
      const user = requireFromMap(usersByKey, studentSeed.userKey);
      const student = await tx.studentProfile.upsert({
        where: {
          tenantId_userId: {
            tenantId: tenant.id,
            userId: user.id,
          },
        },
        create: {
          tenantId: tenant.id,
          userId: user.id,
          name: studentSeed.name,
          gender: studentSeed.gender,
          birthday: new Date(studentSeed.birthday),
          grade: studentSeed.grade,
          school: studentSeed.school,
          notes: studentSeed.notes,
          status: "ACTIVE",
        },
        update: {
          name: studentSeed.name,
          gender: studentSeed.gender,
          birthday: new Date(studentSeed.birthday),
          grade: studentSeed.grade,
          school: studentSeed.school,
          notes: studentSeed.notes,
          status: "ACTIVE",
        },
      });

      studentsByKey.set(studentSeed.key, student);
    }

    const guardiansByKey = new Map<string, { id: string }>();

    for (const guardianSeed of demoSeedConfig.guardians) {
      const user = requireFromMap(usersByKey, guardianSeed.userKey);
      const guardian = await tx.guardianProfile.upsert({
        where: {
          tenantId_userId: {
            tenantId: tenant.id,
            userId: user.id,
          },
        },
        create: {
          tenantId: tenant.id,
          userId: user.id,
          name: guardianSeed.name,
          phone: guardianSeed.phone,
          email: guardianSeed.email,
          status: "ACTIVE",
        },
        update: {
          name: guardianSeed.name,
          phone: guardianSeed.phone,
          email: guardianSeed.email,
          status: "ACTIVE",
        },
      });

      guardiansByKey.set(guardianSeed.key, guardian);
    }

    for (const linkSeed of demoSeedConfig.studentGuardians) {
      const student = requireFromMap(studentsByKey, linkSeed.studentKey);
      const guardian = requireFromMap(guardiansByKey, linkSeed.guardianKey);

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
          relationship: linkSeed.relationship,
          isPrimary: linkSeed.isPrimary,
        },
        update: {
          relationship: linkSeed.relationship,
          isPrimary: linkSeed.isPrimary,
        },
      });
    }

    const subjectsByKey = new Map<string, { id: string }>();

    for (const subjectSeed of demoSeedConfig.subjects) {
      const subject = await tx.subject.upsert({
        where: {
          tenantId_name: {
            tenantId: tenant.id,
            name: subjectSeed.name,
          },
        },
        create: {
          tenantId: tenant.id,
          name: subjectSeed.name,
          code: subjectSeed.code,
          status: "ACTIVE",
        },
        update: {
          code: subjectSeed.code,
          status: "ACTIVE",
        },
      });

      subjectsByKey.set(subjectSeed.key, subject);
    }

    const gradesByKey = new Map<string, { id: string }>();

    for (const gradeSeed of demoSeedConfig.grades) {
      const grade = await tx.grade.upsert({
        where: {
          tenantId_name: {
            tenantId: tenant.id,
            name: gradeSeed.name,
          },
        },
        create: {
          tenantId: tenant.id,
          name: gradeSeed.name,
          sortOrder: gradeSeed.sortOrder,
          status: "ACTIVE",
        },
        update: {
          sortOrder: gradeSeed.sortOrder,
          status: "ACTIVE",
        },
      });

      gradesByKey.set(gradeSeed.key, grade);
    }

    const courseProductsByKey = new Map<string, { id: string }>();

    for (const courseSeed of demoSeedConfig.courseProducts) {
      const subject = requireFromMap(subjectsByKey, courseSeed.subjectKey);
      const grade = requireFromMap(gradesByKey, courseSeed.gradeKey);
      const courseProduct = await tx.courseProduct.upsert({
        where: {
          tenantId_name: {
            tenantId: tenant.id,
            name: courseSeed.name,
          },
        },
        create: {
          tenantId: tenant.id,
          subjectId: subject.id,
          gradeId: grade.id,
          name: courseSeed.name,
          courseType: courseSeed.courseType,
          classType: courseSeed.classType,
          totalHours: courseSeed.totalHours,
          price: courseSeed.price,
          description: courseSeed.description,
          status: "ACTIVE",
        },
        update: {
          subjectId: subject.id,
          gradeId: grade.id,
          courseType: courseSeed.courseType,
          classType: courseSeed.classType,
          totalHours: courseSeed.totalHours,
          price: courseSeed.price,
          description: courseSeed.description,
          status: "ACTIVE",
        },
      });

      courseProductsByKey.set(courseSeed.key, courseProduct);
    }

    const classGroupsByKey = new Map<string, { id: string }>();

    for (const classGroupSeed of demoSeedConfig.classGroups) {
      const courseProduct = requireFromMap(courseProductsByKey, classGroupSeed.courseProductKey);
      const primaryTeacher = requireFromMap(teachersByKey, classGroupSeed.primaryTeacherKey);
      const classGroup = await tx.classGroup.upsert({
        where: {
          tenantId_name: {
            tenantId: tenant.id,
            name: classGroupSeed.name,
          },
        },
        create: {
          tenantId: tenant.id,
          courseProductId: courseProduct.id,
          primaryTeacherId: primaryTeacher.id,
          campusId: campus.id,
          name: classGroupSeed.name,
          capacity: classGroupSeed.capacity,
          status: classGroupSeed.status,
          startsAt: new Date(classGroupSeed.startsAt),
          endsAt: new Date(classGroupSeed.endsAt),
        },
        update: {
          courseProductId: courseProduct.id,
          primaryTeacherId: primaryTeacher.id,
          campusId: campus.id,
          capacity: classGroupSeed.capacity,
          status: classGroupSeed.status,
          startsAt: new Date(classGroupSeed.startsAt),
          endsAt: new Date(classGroupSeed.endsAt),
        },
      });

      for (const studentKey of classGroupSeed.studentKeys) {
        const student = requireFromMap(studentsByKey, studentKey);

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
      }

      classGroupsByKey.set(classGroupSeed.key, classGroup);
    }

    const lessonsByKey = new Map<string, { id: string }>();

    for (const lessonSeed of demoSeedConfig.lessons) {
      const classGroup = requireFromMap(classGroupsByKey, lessonSeed.classGroupKey);
      const teacher = requireFromMap(teachersByKey, lessonSeed.teacherKey);
      const lesson = await upsertLesson(tx, {
        tenantId: tenant.id,
        classGroupId: classGroup.id,
        teacherId: teacher.id,
        title: lessonSeed.title,
        status: lessonSeed.status,
      });

      lessonsByKey.set(lessonSeed.key, lesson);
    }

    for (const scheduleSeed of demoSeedConfig.schedules) {
      const classGroup = requireFromMap(classGroupsByKey, scheduleSeed.classGroupKey);
      const teacher = requireFromMap(teachersByKey, scheduleSeed.teacherKey);
      const room = requireFromMap(roomsByKey, scheduleSeed.roomKey);
      const lesson = requireFromMap(lessonsByKey, scheduleSeed.lessonKey);

      await upsertSchedule(tx, {
        tenantId: tenant.id,
        classGroupId: classGroup.id,
        teacherId: teacher.id,
        campusId: campus.id,
        roomId: room.id,
        lessonId: lesson.id,
        startAt: new Date(scheduleSeed.startAt),
        endAt: new Date(scheduleSeed.endAt),
        status: scheduleSeed.status,
      });
    }

    return {
      tenant,
      users: usersByKey.size,
      rooms: roomsByKey.size,
      students: studentsByKey.size,
      classGroups: classGroupsByKey.size,
      schedules: demoSeedConfig.schedules.length,
    };
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed EduOS demo data.");
  }

  const result = await seedDemoData();

  console.log(
    `Seeded ${result.tenant.name} (${result.tenant.slug}) with ${result.users} users, ` +
      `${result.students} students, ${result.rooms} rooms, ${result.classGroups} classes, ` +
      `${result.schedules} schedules.`,
  );
  console.log(`Demo login password: ${demoUserPassword}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
