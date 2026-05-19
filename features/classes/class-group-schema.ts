import { z } from "zod";

export const classGroupStatusValues = [
  "PLANNING",
  "ACTIVE",
  "PAUSED",
  "FINISHED",
  "ARCHIVED",
] as const;

export const classGroupStatusLabels = {
  PLANNING: "筹备中",
  ACTIVE: "开班中",
  PAUSED: "已暂停",
  FINISHED: "已结课",
  ARCHIVED: "已归档",
} as const satisfies Record<(typeof classGroupStatusValues)[number], string>;

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const classGroupFormSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    courseProductId: z.string().cuid(),
    primaryTeacherId: z.string().cuid(),
    campusId: z.string().cuid(),
    capacity: z.coerce.number().int().min(1).max(999),
    status: z.enum(classGroupStatusValues),
    startsAt: dateStringSchema.transform((value) => new Date(`${value}T00:00:00.000Z`)),
    endsAt: dateStringSchema.transform((value) => new Date(`${value}T00:00:00.000Z`)),
  })
  .refine((value) => value.endsAt >= value.startsAt, {
    path: ["endsAt"],
    message: "Class group end date must be after start date.",
  });

export const classGroupStudentFormSchema = z.object({
  classGroupId: z.string().cuid(),
  studentId: z.string().cuid(),
  confirmCapacityOverride: z.preprocess((value) => value === "on", z.boolean()),
});

export const classGroupIdSchema = z.string().cuid();
export const classGroupStudentIdSchema = z.string().cuid();

export type ClassGroupFormValues = z.infer<typeof classGroupFormSchema>;
export type ClassGroupStudentFormValues = z.infer<typeof classGroupStudentFormSchema>;
export type ClassGroupStatusValue = (typeof classGroupStatusValues)[number];

export function getClassGroupFormValues(formData: FormData) {
  return classGroupFormSchema.safeParse({
    name: formData.get("name"),
    courseProductId: formData.get("courseProductId"),
    primaryTeacherId: formData.get("primaryTeacherId"),
    campusId: formData.get("campusId"),
    capacity: formData.get("capacity"),
    status: formData.get("status"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });
}

export function getClassGroupStudentFormValues(formData: FormData) {
  return classGroupStudentFormSchema.safeParse({
    classGroupId: formData.get("classGroupId"),
    studentId: formData.get("studentId"),
    confirmCapacityOverride: formData.get("confirmCapacityOverride"),
  });
}
