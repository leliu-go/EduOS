import { z } from "zod";

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

function optionalUrl() {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().url().max(500).optional(),
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

export const homeworkSubmissionSchema = z
  .object({
    homeworkId: z.string().cuid(),
    contentText: optionalText(4000),
    fileName: optionalText(160),
    fileUrl: optionalUrl(),
    imageUrl: optionalUrl(),
    returnTo: z.enum(["/student/homework"]).default("/student/homework"),
  })
  .refine((values) => Boolean(values.contentText || values.fileUrl || values.imageUrl), {
    path: ["contentText"],
    message: "Submission must include text, image, or file metadata.",
  });

export const homeworkCorrectionStatusValues = ["CORRECTED", "NEEDS_REVISION"] as const;

export const homeworkCorrectionStatusLabels = {
  CORRECTED: "已批改",
  NEEDS_REVISION: "需订正",
} as const satisfies Record<(typeof homeworkCorrectionStatusValues)[number], string>;

export const homeworkCorrectionSchema = z.object({
  submissionId: z.string().cuid(),
  status: z.enum(homeworkCorrectionStatusValues),
  score: z.preprocess(
    (value) =>
      value === null || (typeof value === "string" && value.trim() === "") ? undefined : value,
    z.coerce.number().int().min(0).max(100).optional(),
  ),
  comment: z.string().trim().min(1).max(2000),
  returnTo: z.enum(["/teacher/homework"]).default("/teacher/homework"),
});

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

export function getHomeworkSubmissionValues(formData: FormData) {
  return homeworkSubmissionSchema.safeParse({
    homeworkId: formData.get("homeworkId"),
    contentText: formData.get("contentText"),
    fileName: formData.get("fileName"),
    fileUrl: formData.get("fileUrl"),
    imageUrl: formData.get("imageUrl"),
    returnTo: formData.get("returnTo") ?? undefined,
  });
}

export function getHomeworkCorrectionValues(formData: FormData) {
  return homeworkCorrectionSchema.safeParse({
    submissionId: formData.get("submissionId"),
    status: formData.get("status"),
    score: formData.get("score"),
    comment: formData.get("comment"),
    returnTo: formData.get("returnTo") ?? undefined,
  });
}

export type HomeworkCreateValues = z.infer<typeof homeworkCreateSchema>;
export type HomeworkSubmissionValues = z.infer<typeof homeworkSubmissionSchema>;
export type HomeworkCorrectionValues = z.infer<typeof homeworkCorrectionSchema>;
