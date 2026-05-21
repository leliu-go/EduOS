import { z } from "zod";

export const learningTaskTypeValues = [
  "READING",
  "MEMORIZATION",
  "PRACTICE",
  "SPECIAL_TRAINING",
] as const;

export const learningTaskTypeLabels = {
  READING: "每日阅读",
  MEMORIZATION: "单词打卡",
  PRACTICE: "听力练习",
  SPECIAL_TRAINING: "针对练习",
} as const satisfies Record<(typeof learningTaskTypeValues)[number], string>;

export const learningTaskTypeHints = {
  READING: "阅读材料、短文精读、摘抄或阅读理解",
  MEMORIZATION: "词汇背诵、默写、例句跟读",
  PRACTICE: "听力材料、听写、跟读复述",
  SPECIAL_TRAINING: "错题薄弱点、专项题组、个性化加练",
} as const satisfies Record<(typeof learningTaskTypeValues)[number], string>;

function optionalCuid() {
  return z.preprocess(
    (value) =>
      value === null || (typeof value === "string" && value.trim() === "") ? undefined : value,
    z.string().cuid().optional(),
  );
}

function optionalText(maxLength: number) {
  return z.preprocess(
    (value) =>
      value === null || (typeof value === "string" && value.trim() === "") ? undefined : value,
    z.string().trim().max(maxLength).optional(),
  );
}

function dateValue() {
  return z.preprocess((value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) {
        return value;
      }

      const parsed = new Date(`${trimmed}T00:00:00.000Z`);

      return Number.isNaN(parsed.getTime()) ? value : parsed;
    }

    return value;
  }, z.date());
}

export const learningTaskCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: optionalText(2000),
    taskType: z.enum(learningTaskTypeValues),
    targetDate: dateValue(),
    classGroupId: optionalCuid(),
    studentId: optionalCuid(),
    returnTo: z.enum(["/dashboard/learning"]).default("/dashboard/learning"),
  })
  .refine((values) => [values.classGroupId, values.studentId].filter(Boolean).length === 1, {
    path: ["classGroupId"],
    message: "Learning task must target exactly one class or student.",
  });

export const learningTaskCheckInSchema = z.object({
  taskId: z.string().cuid(),
  note: optionalText(1000),
});

export function getLearningTaskCreateValues(formData: FormData) {
  return learningTaskCreateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    taskType: formData.get("taskType"),
    targetDate: formData.get("targetDate"),
    classGroupId: formData.get("classGroupId"),
    studentId: formData.get("studentId"),
    returnTo: formData.get("returnTo") ?? undefined,
  });
}

export function getLearningTaskCheckInValues(formData: FormData) {
  return learningTaskCheckInSchema.safeParse({
    taskId: formData.get("taskId"),
    note: formData.get("note"),
  });
}

export type LearningTaskCreateValues = z.infer<typeof learningTaskCreateSchema>;
export type LearningTaskTypeValue = (typeof learningTaskTypeValues)[number];
