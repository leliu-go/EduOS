import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { findScheduleConflicts } from "../features/scheduling/conflicts";

describe("schedule conflict detection", () => {
  it("detects teacher, room, and class group duplicate conflicts", async () => {
    const conflicts = await findScheduleConflicts(
      {
        classGroupStudent: {
          findMany: async () => [],
        },
        campus: {
          findMany: async () => [
            {
              id: "campus-1",
              name: "主校区",
              businessHours: "08:00-20:00",
            },
          ],
        },
        schedule: {
          findMany: async () => [
            {
              id: "schedule-1",
              classGroupId: "class-1",
              teacherId: "teacher-1",
              roomId: "room-1",
              startAt: new Date("2026-09-02T10:30:00.000Z"),
              endAt: new Date("2026-09-02T11:30:00.000Z"),
              teacher: { name: "王老师" },
              room: { name: "A101", campus: { name: "主校区" } },
              classGroup: {
                name: "初二数学 A 班",
                students: [],
              },
            },
          ],
        },
      },
      "tenant-1",
      [
        {
          classGroupId: "class-1",
          teacherId: "teacher-1",
          roomId: "room-1",
          campusId: "campus-1",
          startAt: new Date("2026-09-02T10:00:00.000Z"),
          endAt: new Date("2026-09-02T12:00:00.000Z"),
        },
      ],
    );

    expect(conflicts.map((conflict) => conflict.type)).toEqual([
      "teacher_time",
      "room_time",
      "class_group_duplicate",
    ]);
    expect(conflicts.map((conflict) => conflict.message).join("\n")).toContain("王老师");
    expect(conflicts.map((conflict) => conflict.message).join("\n")).toContain("A101");
    expect(conflicts.map((conflict) => conflict.message).join("\n")).toContain("初二数学 A 班");
  });

  it("detects student time and campus business hour conflicts", async () => {
    const conflicts = await findScheduleConflicts(
      {
        classGroupStudent: {
          findMany: async () => [
            {
              classGroupId: "class-1",
              studentId: "student-1",
            },
          ],
        },
        campus: {
          findMany: async () => [
            {
              id: "campus-1",
              name: "主校区",
              businessHours: "09:00-18:00",
            },
          ],
        },
        schedule: {
          findMany: async () => [
            {
              id: "schedule-2",
              classGroupId: "class-2",
              teacherId: "teacher-2",
              roomId: "room-2",
              startAt: new Date("2026-09-02T08:30:00.000Z"),
              endAt: new Date("2026-09-02T09:30:00.000Z"),
              teacher: { name: "李老师" },
              room: { name: "B201", campus: { name: "主校区" } },
              classGroup: {
                name: "初二英语 B 班",
                students: [
                  {
                    studentId: "student-1",
                  },
                ],
              },
            },
          ],
        },
      },
      "tenant-1",
      [
        {
          classGroupId: "class-1",
          teacherId: "teacher-1",
          roomId: "room-1",
          campusId: "campus-1",
          startAt: new Date("2026-09-02T08:00:00.000Z"),
          endAt: new Date("2026-09-02T10:00:00.000Z"),
        },
      ],
    );

    expect(conflicts.map((conflict) => conflict.type)).toEqual([
      "campus_business_hours",
      "student_time",
    ]);
    expect(conflicts[0]?.message).toContain("09:00-18:00");
    expect(conflicts[1]?.message).toContain("学生");
  });

  it("blocks schedule actions and renders exact conflict reasons", () => {
    const actions = readFileSync(join(process.cwd(), "features/scheduling/actions.ts"), "utf8");
    const page = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/scheduling/page.tsx"),
      "utf8",
    );

    expect(actions).toContain("findScheduleConflicts");
    expect(actions).toContain("redirectWithScheduleConflicts");
    expect(actions).toContain("conflicts.map");
    expect(page).toContain("conflictMessages");
    expect(page).toContain("teacher_time");
    expect(page).toContain("room_time");
    expect(page).toContain("student_time");
    expect(page).toContain("campus_business_hours");
    expect(page).toContain("class_group_duplicate");
  });
});
