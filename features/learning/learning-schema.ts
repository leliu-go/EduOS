import { z } from "zod";

export const learningTaskTypeValues = [
  "READING",
  "MEMORIZATION",
  "PRACTICE",
  "SPECIAL_TRAINING",
] as const;

export const learningTaskTypeLabels = {
  READING: "阅读",
  MEMORIZATION: "背诵",
  PRACTICE: "练习",
  SPECIAL_TRAINING: "专项训练",
} as const satisfies Record<(typeof learningTaskTypeValues)[number], string>;

export const learningTaskCheckInSchema = z.object({
  taskId: z.string().cuid(),
  note: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(1000).optional(),
  ),
});

export function getLearningTaskCheckInValues(formData: FormData) {
  return learningTaskCheckInSchema.safeParse({
    taskId: formData.get("taskId"),
    note: formData.get("note"),
  });
}
