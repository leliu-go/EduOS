import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  getScheduleCancelFormValues,
  getScheduleMakeUpFormValues,
  getScheduleRescheduleFormValues,
} from "../features/scheduling/schedule-schema";

describe("schedule change flow", () => {
  it("requires a reason for reschedule, cancellation, and make-up lesson", () => {
    const rescheduleFormData = new FormData();
    rescheduleFormData.set("scheduleId", "cm00000000000000000000001");
    rescheduleFormData.set("roomId", "cm00000000000000000000002");
    rescheduleFormData.set("startAt", "2026-09-03T10:00");
    rescheduleFormData.set("endAt", "2026-09-03T12:00");
    rescheduleFormData.set("reason", "老师请假顺延");

    expect(getScheduleRescheduleFormValues(rescheduleFormData).success).toBe(true);

    rescheduleFormData.set("reason", "");
    expect(getScheduleRescheduleFormValues(rescheduleFormData).success).toBe(false);

    const cancelFormData = new FormData();
    cancelFormData.set("scheduleId", "cm00000000000000000000001");
    cancelFormData.set("reason", "节假日停课");

    expect(getScheduleCancelFormValues(cancelFormData).success).toBe(true);

    cancelFormData.set("reason", "");
    expect(getScheduleCancelFormValues(cancelFormData).success).toBe(false);

    const makeUpFormData = new FormData();
    makeUpFormData.set("scheduleId", "cm00000000000000000000001");
    makeUpFormData.set("roomId", "cm00000000000000000000002");
    makeUpFormData.set("startAt", "2026-09-10T10:00");
    makeUpFormData.set("endAt", "2026-09-10T12:00");
    makeUpFormData.set("reason", "补回取消课次");

    expect(getScheduleMakeUpFormValues(makeUpFormData).success).toBe(true);

    makeUpFormData.set("reason", "");
    expect(getScheduleMakeUpFormValues(makeUpFormData).success).toBe(false);
  });

  it("records before/after change logs and audit logs for schedule changes", () => {
    const actions = readFileSync(join(process.cwd(), "features/scheduling/actions.ts"), "utf8");

    expect(actions).toContain("rescheduleScheduleAction");
    expect(actions).toContain("cancelScheduleAction");
    expect(actions).toContain("createMakeUpScheduleAction");
    expect(actions).toContain("scheduleChangeLog.create");
    expect(actions).toContain("beforeJson");
    expect(actions).toContain("afterJson");
    expect(actions).toContain("reason");
    expect(actions).toContain('changeType: "RESCHEDULE"');
    expect(actions).toContain('changeType: "CANCEL"');
    expect(actions).toContain('changeType: "MAKE_UP"');
    expect(actions).toContain('action: "schedule.reschedule"');
    expect(actions).toContain('action: "schedule.cancel"');
    expect(actions).toContain('action: "schedule.makeUp"');
    expect(actions).toContain("writeAuditLog");
  });

  it("renders schedule change actions from the calendar", () => {
    const page = readFileSync(
      join(process.cwd(), "app/(dashboard)/dashboard/scheduling/page.tsx"),
      "utf8",
    );
    const dialogs = readFileSync(
      join(process.cwd(), "features/scheduling/schedule-change-actions.tsx"),
      "utf8",
    );

    expect(page).toContain("ScheduleChangeActions");
    expect(page).toContain("rooms={calendarData.options.rooms}");
    expect(dialogs).toContain("rescheduleScheduleAction");
    expect(dialogs).toContain("cancelScheduleAction");
    expect(dialogs).toContain("createMakeUpScheduleAction");
    expect(dialogs).toContain('name="reason"');
    expect(dialogs).toContain("改期");
    expect(dialogs).toContain("取消");
    expect(dialogs).toContain("补课");
  });
});
