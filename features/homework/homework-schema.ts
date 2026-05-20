import { z } from "zod";

function optionalCuid() {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().cuid().optional(),
  );
}

function dateTimeValue() {
  return z.preprocess((value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) {
        return value;
      }

      const parsed = new Date(trimmed);

      return Number.isNaN(parsed.getTime()) ? value : parsed;
    }

    return value;
  }, z.date());
}

const homeworkReturnToSchema = z
  .preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
    z.enum(["/dashboard/homework", "/teacher/homework"]).optional(),
  )
  .default("/teacher/homework");

export const homeworkCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    instructions: z.string().trim().min(1).max(2000),
    dueAt: dateTimeValue(),
    classGroupId: optionalCuid(),
    lessonId: optionalCuid(),
    studentId: optionalCuid(),
    returnTo: homeworkReturnToSchema,
  })
  .refine(
    (values) =>
      [values.classGroupId, values.lessonId, values.studentId].filter(Boolean).length === 1,
    {
      path: ["classGroupId"],
      message: "Homework must target exactly one class, lesson, or student.",
    },
  );

export function getHomeworkCreateValues(formData: FormData) {
  return homeworkCreateSchema.safeParse({
    title: formData.get("title"),
    instructions: formData.get("instructions"),
    dueAt: formData.get("dueAt"),
    classGroupId: formData.get("classGroupId"),
    lessonId: formData.get("lessonId"),
    studentId: formData.get("studentId"),
    returnTo: formData.get("returnTo") ?? undefined,
  });
}

export type HomeworkCreateValues = z.infer<typeof homeworkCreateSchema>;
