type DemoRoleKey =
  | "ORG_ADMIN"
  | "CAMPUS_ADMIN"
  | "ACADEMIC"
  | "FINANCE"
  | "TEACHER"
  | "STUDENT"
  | "PARENT";

export const demoUserPassword = process.env.EDUOS_DEMO_PASSWORD ?? "EduOS-demo-123456";

export const demoSeedConfig = {
  tenant: {
    name: "EduOS Demo Academy",
    slug: "eduos-demo",
  },
  campus: {
    name: "Demo Main Campus",
    address: "100 Learning Road",
    businessHours: "08:00-21:00",
  },
  rooms: [
    {
      key: "room-a101",
      name: "A101",
      capacity: 16,
      equipment: "Whiteboard, projector",
    },
    {
      key: "room-b201",
      name: "B201",
      capacity: 12,
      equipment: "Whiteboard, document camera",
    },
  ],
  roles: [
    {
      key: "ORG_ADMIN",
      name: "Organization Admin",
    },
    {
      key: "CAMPUS_ADMIN",
      name: "Campus Manager",
    },
    {
      key: "ACADEMIC",
      name: "Academic Affairs",
    },
    {
      key: "FINANCE",
      name: "Finance",
    },
    {
      key: "TEACHER",
      name: "Teacher",
    },
    {
      key: "STUDENT",
      name: "Student",
    },
    {
      key: "PARENT",
      name: "Parent",
    },
  ] satisfies Array<{ key: DemoRoleKey; name: string }>,
  users: [
    {
      key: "admin",
      roleKey: "ORG_ADMIN",
      name: "Demo Admin",
      email: "admin@eduos.test",
      phone: "18800000001",
    },
    {
      key: "academic",
      roleKey: "ACADEMIC",
      name: "Demo Academic",
      email: "academic@eduos.test",
      phone: "18800000002",
    },
    {
      key: "finance",
      roleKey: "FINANCE",
      name: "Demo Finance",
      email: "finance@eduos.test",
      phone: "18800000003",
    },
    {
      key: "teacher",
      roleKey: "TEACHER",
      name: "Demo Teacher Chen",
      email: "teacher@eduos.test",
      phone: "18800000004",
    },
    {
      key: "student-1",
      roleKey: "STUDENT",
      name: "Demo Student Lin",
      email: "student.lin@eduos.test",
      phone: "18800000005",
    },
    {
      key: "student-2",
      roleKey: "STUDENT",
      name: "Demo Student Wang",
      email: "student.wang@eduos.test",
      phone: "18800000006",
    },
    {
      key: "guardian-1",
      roleKey: "PARENT",
      name: "Demo Parent Lin",
      email: "parent.lin@eduos.test",
      phone: "18800000007",
    },
  ] satisfies Array<{
    key: string;
    roleKey: DemoRoleKey;
    name: string;
    email: string;
    phone: string;
  }>,
  teachers: [
    {
      key: "teacher-1",
      userKey: "teacher",
      name: "Demo Teacher Chen",
      phone: "18800000101",
      email: "teacher@eduos.test",
      subjects: ["Math"],
      grades: ["Grade 7"],
      availableTimeNotes: "Weekday evenings and Saturday morning",
    },
  ],
  students: [
    {
      key: "student-1",
      userKey: "student-1",
      name: "Demo Student Lin",
      gender: "FEMALE",
      birthday: "2013-09-01T00:00:00.000Z",
      grade: "Grade 7",
      school: "Demo Middle School",
      notes: "Demo seed student with active class membership.",
    },
    {
      key: "student-2",
      userKey: "student-2",
      name: "Demo Student Wang",
      gender: "MALE",
      birthday: "2013-11-15T00:00:00.000Z",
      grade: "Grade 7",
      school: "Demo Middle School",
      notes: "Demo seed student with active class membership.",
    },
  ],
  guardians: [
    {
      key: "guardian-1",
      userKey: "guardian-1",
      name: "Demo Parent Lin",
      phone: "18800001001",
      email: "parent.lin@eduos.test",
    },
  ],
  studentGuardians: [
    {
      studentKey: "student-1",
      guardianKey: "guardian-1",
      relationship: "MOTHER",
      isPrimary: true,
    },
    {
      studentKey: "student-2",
      guardianKey: "guardian-1",
      relationship: "OTHER",
      isPrimary: false,
    },
  ],
  subjects: [
    {
      key: "math",
      name: "Math",
      code: "MATH",
    },
  ],
  grades: [
    {
      key: "grade-7",
      name: "Grade 7",
      sortOrder: 7,
    },
  ],
  courseProducts: [
    {
      key: "math-foundation",
      subjectKey: "math",
      gradeKey: "grade-7",
      name: "Grade 7 Math Foundations",
      courseType: "SMALL_GROUP",
      classType: "OFFLINE",
      totalHours: 48,
      price: "3980",
      description: "Demo small-group math course for MVP walkthroughs.",
    },
  ],
  classGroups: [
    {
      key: "math-a",
      courseProductKey: "math-foundation",
      primaryTeacherKey: "teacher-1",
      name: "Grade 7 Math A",
      capacity: 12,
      status: "ACTIVE",
      startsAt: "2026-05-01T00:00:00.000Z",
      endsAt: "2026-08-31T23:59:59.000Z",
      studentKeys: ["student-1", "student-2"],
    },
  ],
  lessons: [
    {
      key: "lesson-linear-equations",
      classGroupKey: "math-a",
      teacherKey: "teacher-1",
      title: "Linear Equations Review",
      status: "SCHEDULED",
    },
    {
      key: "lesson-word-problems",
      classGroupKey: "math-a",
      teacherKey: "teacher-1",
      title: "Word Problem Strategies",
      status: "SCHEDULED",
    },
  ],
  schedules: [
    {
      key: "schedule-linear-equations",
      classGroupKey: "math-a",
      teacherKey: "teacher-1",
      roomKey: "room-a101",
      lessonKey: "lesson-linear-equations",
      startAt: "2026-05-23T10:00:00.000Z",
      endAt: "2026-05-23T12:00:00.000Z",
      status: "SCHEDULED",
    },
    {
      key: "schedule-word-problems",
      classGroupKey: "math-a",
      teacherKey: "teacher-1",
      roomKey: "room-b201",
      lessonKey: "lesson-word-problems",
      startAt: "2026-05-30T10:00:00.000Z",
      endAt: "2026-05-30T12:00:00.000Z",
      status: "SCHEDULED",
    },
  ],
} as const;
