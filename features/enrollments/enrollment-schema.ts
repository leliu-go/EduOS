import { z } from "zod";

export const enrollmentStatusValues = ["ACTIVE", "PAUSED", "COMPLETED", "WITHDRAWN"] as const;

export const enrollmentStatusLabels = {
  ACTIVE: "在读",
  PAUSED: "暂停",
  COMPLETED: "结课",
  WITHDRAWN: "退班",
} as const satisfies Record<(typeof enrollmentStatusValues)[number], string>;

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

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

export const enrollmentFormSchema = z.object({
  studentId: z.string().cuid(),
  courseProductId: z.string().cuid(),
  classGroupId: optionalCuid(),
  purchasedHours: z.coerce.number().int().min(1).max(9999),
  enrolledAt: dateStringSchema.transform((value) => new Date(`${value}T00:00:00.000Z`)),
  notes: optionalText(500),
});

export type EnrollmentFormValues = z.infer<typeof enrollmentFormSchema>;

export function getEnrollmentFormValues(formData: FormData) {
  return enrollmentFormSchema.safeParse({
    studentId: formData.get("studentId"),
    courseProductId: formData.get("courseProductId"),
    classGroupId: formData.get("classGroupId"),
    purchasedHours: formData.get("purchasedHours"),
    enrolledAt: formData.get("enrolledAt"),
    notes: formData.get("notes"),
  });
}
