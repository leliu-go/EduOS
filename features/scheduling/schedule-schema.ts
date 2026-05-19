import { z } from "zod";

export const lessonStatusValues = ["PLANNED", "SCHEDULED", "COMPLETED", "CANCELLED"] as const;
export const scheduleStatusValues = [
  "SCHEDULED",
  "RESCHEDULED",
  "CANCELLED",
  "COMPLETED",
  "MAKE_UP",
] as const;
export const scheduleChangeTypeValues = ["CREATE", "RESCHEDULE", "CANCEL", "MAKE_UP"] as const;

export const lessonStatusLabels = {
  PLANNED: "待排课",
  SCHEDULED: "已排课",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
} as const satisfies Record<(typeof lessonStatusValues)[number], string>;

export const scheduleStatusLabels = {
  SCHEDULED: "已排课",
  RESCHEDULED: "已改期",
  CANCELLED: "已取消",
  COMPLETED: "已完成",
  MAKE_UP: "补课",
} as const satisfies Record<(typeof scheduleStatusValues)[number], string>;

export const scheduleChangeTypeLabels = {
  CREATE: "创建",
  RESCHEDULE: "改期",
  CANCEL: "取消",
  MAKE_UP: "补课",
} as const satisfies Record<(typeof scheduleChangeTypeValues)[number], string>;

function optionalCuid() {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().cuid().optional(),
  );
}

function optionalText(maxLength: number) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maxLength).optional(),
  );
}

const dateTimeSchema = z
  .string()
  .datetime()
  .transform((value) => new Date(value));

export const lessonDataSchema = z.object({
  classGroupId: z.string().cuid(),
  teacherId: z.string().cuid(),
  title: z.string().trim().min(1).max(120),
  status: z.enum(lessonStatusValues),
});

export const scheduleDataSchema = z
  .object({
    classGroupId: z.string().cuid(),
    teacherId: z.string().cuid(),
    campusId: z.string().cuid(),
    roomId: z.string().cuid(),
    lessonId: optionalCuid(),
    startAt: dateTimeSchema,
    endAt: dateTimeSchema,
    status: z.enum(scheduleStatusValues),
    recurrenceRule: optionalText(300),
    sourceScheduleId: optionalCuid(),
  })
  .refine((value) => value.endAt > value.startAt, {
    path: ["endAt"],
    message: "Schedule end time must be after start time.",
  });

export const scheduleChangeLogDataSchema = z.object({
  scheduleId: z.string().cuid(),
  changeType: z.enum(scheduleChangeTypeValues),
  reason: optionalText(300),
});

export type LessonDataValues = z.infer<typeof lessonDataSchema>;
export type ScheduleDataValues = z.infer<typeof scheduleDataSchema>;
export type ScheduleChangeLogDataValues = z.infer<typeof scheduleChangeLogDataSchema>;
