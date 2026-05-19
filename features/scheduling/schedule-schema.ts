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

function normalizeFormDateTimeValue(value: string) {
  const trimmedValue = value.trim();

  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmedValue)) {
    return `${trimmedValue}:00.000Z`;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmedValue)) {
    return `${trimmedValue}.000Z`;
  }

  return trimmedValue;
}

const formDateTimeSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) => new Date(normalizeFormDateTimeValue(value)))
  .refine((value) => !Number.isNaN(value.getTime()), {
    message: "Invalid date time.",
  });

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

export const scheduleCreateFormSchema = z
  .object({
    classGroupId: z.string().cuid(),
    teacherId: z.string().cuid(),
    roomId: z.string().cuid(),
    lessonTitle: z.string().trim().min(1).max(120),
    startAt: formDateTimeSchema,
    endAt: formDateTimeSchema,
  })
  .refine((value) => value.endAt > value.startAt, {
    path: ["endAt"],
    message: "Schedule end time must be after start time.",
  });

export const scheduleBatchCreateFormSchema = z
  .object({
    classGroupId: z.string().cuid(),
    teacherId: z.string().cuid(),
    roomId: z.string().cuid(),
    lessonTitle: z.string().trim().min(1).max(120),
    firstStartAt: formDateTimeSchema,
    firstEndAt: formDateTimeSchema,
    weeks: z.coerce.number().int().min(1).max(52),
  })
  .refine((value) => value.firstEndAt > value.firstStartAt, {
    path: ["firstEndAt"],
    message: "Schedule end time must be after start time.",
  });

export function getScheduleCreateFormValues(formData: FormData) {
  return scheduleCreateFormSchema.safeParse({
    classGroupId: formData.get("classGroupId"),
    teacherId: formData.get("teacherId"),
    roomId: formData.get("roomId"),
    lessonTitle: formData.get("lessonTitle"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
  });
}

export function getScheduleBatchCreateFormValues(formData: FormData) {
  return scheduleBatchCreateFormSchema.safeParse({
    classGroupId: formData.get("classGroupId"),
    teacherId: formData.get("teacherId"),
    roomId: formData.get("roomId"),
    lessonTitle: formData.get("lessonTitle"),
    firstStartAt: formData.get("firstStartAt"),
    firstEndAt: formData.get("firstEndAt"),
    weeks: formData.get("weeks"),
  });
}

export type LessonDataValues = z.infer<typeof lessonDataSchema>;
export type ScheduleDataValues = z.infer<typeof scheduleDataSchema>;
export type ScheduleChangeLogDataValues = z.infer<typeof scheduleChangeLogDataSchema>;
export type ScheduleCreateFormValues = z.infer<typeof scheduleCreateFormSchema>;
export type ScheduleBatchCreateFormValues = z.infer<typeof scheduleBatchCreateFormSchema>;
