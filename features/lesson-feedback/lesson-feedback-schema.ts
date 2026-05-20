import { z } from "zod";

function requiredText(maxLength: number) {
  return z.string().trim().min(1).max(maxLength);
}

export const lessonFeedbackSchema = z.object({
  lessonId: z.string().cuid(),
  studentId: z.string().cuid(),
  content: requiredText(1200),
  performance: requiredText(1200),
  mastery: requiredText(1200),
  homework: requiredText(1200),
  suggestion: requiredText(1200),
  returnTo: z
    .string()
    .trim()
    .regex(/^\/teacher\/lessons\/[a-z0-9]+$/)
    .max(120),
});

export function getLessonFeedbackValues(formData: FormData) {
  return lessonFeedbackSchema.safeParse({
    lessonId: formData.get("lessonId"),
    studentId: formData.get("studentId"),
    content: formData.get("content"),
    performance: formData.get("performance"),
    mastery: formData.get("mastery"),
    homework: formData.get("homework"),
    suggestion: formData.get("suggestion"),
    returnTo: formData.get("returnTo"),
  });
}

export type LessonFeedbackValues = z.infer<typeof lessonFeedbackSchema>;
