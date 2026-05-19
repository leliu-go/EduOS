import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { buildWeeklyScheduleOccurrences } from "../features/scheduling/recurring";
import { getScheduleBatchCreateFormValues } from "../features/scheduling/schedule-schema";

describe("batch scheduling flow", () => {
  it("validates weekly schedule generation form values", () => {
    const formData = new FormData();
    formData.set("classGroupId", "cm00000000000000000000001");
    formData.set("teacherId", "cm00000000000000000000002");
    formData.set("roomId", "cm00000000000000000000003");
    formData.set("lessonTitle", "同步提升课");
    formData.set("firstStartAt", "2026-09-02T10:00");
    formData.set("firstEndAt", "2026-09-02T12:00");
    formData.set("weeks", "4");

    const parsed = getScheduleBatchCreateFormValues(formData);

    expect(parsed.success).toBe(true);
    expect(parsed.success ? parsed.data.weeks : 0).toBe(4);
    expect(parsed.success ? parsed.data.firstStartAt : null).toBeInstanceOf(Date);

    formData.set("weeks", "0");
    expect(getScheduleBatchCreateFormValues(formData).success).toBe(false);
  });

  it("builds weekly recurring preview occurrences", () => {
    const occurrences = buildWeeklyScheduleOccurrences({
      lessonTitle: "同步提升课",
      startAt: new Date("2026-09-02T10:00:00.000Z"),
      endAt: new Date("2026-09-02T12:00:00.000Z"),
      weeks: 3,
    });

    expect(occurrences).toEqual([
      {
        title: "同步提升课 第1讲",
        startAt: new Date("2026-09-02T10:00:00.000Z"),
        endAt: new Date("2026-09-02T12:00:00.000Z"),
      },
      {
        title: "同步提升课 第2讲",
        startAt: new Date("2026-09-09T10:00:00.000Z"),
        endAt: new Date("2026-09-09T12:00:00.000Z"),
      },
      {
        title: "同步提升课 第3讲",
        startAt: new Date("2026-09-16T10:00:00.000Z"),
        endAt: new Date("2026-09-16T12:00:00.000Z"),
      },
    ]);
  });

  it("runs basic conflict detection before committing recurring schedules", () => {
    const actions = readFileSync(join(process.cwd(), "features/scheduling/actions.ts"), "utf8");
    const conflicts = readFileSync(join(process.cwd(), "features/scheduling/conflicts.ts"), "utf8");

    expect(actions).toContain("createWeeklySchedulesAction");
    expect(actions).toContain("getScheduleBatchCreateFormValues");
    expect(actions).toContain("buildWeeklyScheduleOccurrences");
    expect(actions).toContain("findBasicScheduleConflicts");
    expect(actions).toContain("prisma.$transaction");
    expect(actions).toContain("tx.lesson.create");
    expect(actions).toContain("tx.schedule.create");
    expect(actions).toContain("recurrenceRule");
    expect(actions).toContain('action: "schedule.batchCreate"');
    expect(conflicts).toContain("findBasicScheduleConflicts");
    expect(conflicts).toContain("teacherId");
    expect(conflicts).toContain("roomId");
    expect(conflicts).toContain("classGroupId");
  });

  it("renders recurring schedule dialog with preview before submit", () => {
    const page = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/scheduling/page.tsx"),
      "utf8",
    );
    const dialog = readFileSync(
      join(process.cwd(), "features/scheduling/schedule-batch-dialog.tsx"),
      "utf8",
    );

    expect(page).toContain("ScheduleBatchDialog");
    expect(page).toContain("schedule_conflict");
    expect(dialog).toContain('"use client"');
    expect(dialog).toContain("buildWeeklyScheduleOccurrences");
    expect(dialog).toContain("createWeeklySchedulesAction");
    expect(dialog).toContain("预览");
    expect(dialog).toContain('name="weeks"');
    expect(dialog).toContain('name="firstStartAt"');
    expect(dialog).toContain('name="firstEndAt"');
  });
});
