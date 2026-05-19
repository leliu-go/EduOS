import { z } from "zod";

export const courseTypeValues = [
  "ONE_ON_ONE",
  "SMALL_GROUP",
  "LARGE_GROUP",
  "EVENING_TUTORING",
  "INTENSIVE",
] as const;
export const classTypeValues = ["OFFLINE", "ONLINE", "HYBRID"] as const;
export const courseProductStatusValues = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;

export const courseTypeLabels = {
  ONE_ON_ONE: "一对一",
  SMALL_GROUP: "小班课",
  LARGE_GROUP: "大班课",
  EVENING_TUTORING: "晚辅",
  INTENSIVE: "冲刺班",
} as const satisfies Record<(typeof courseTypeValues)[number], string>;

export const classTypeLabels = {
  OFFLINE: "线下课",
  ONLINE: "线上课",
  HYBRID: "混合课",
} as const satisfies Record<(typeof classTypeValues)[number], string>;

export const courseProductStatusLabels = {
  ACTIVE: "上架",
  INACTIVE: "下架",
  ARCHIVED: "已归档",
} as const satisfies Record<(typeof courseProductStatusValues)[number], string>;

function optionalText(maxLength: number) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maxLength).optional(),
  );
}

const priceSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .refine((value) => Number(value) >= 0 && Number(value) <= 9_999_999, {
      message: "Price must be between 0 and 9999999.",
    }),
);

export const courseProductFormSchema = z.object({
  name: z.string().trim().min(1).max(100),
  subjectId: z.string().cuid(),
  gradeId: z.string().cuid(),
  courseType: z.enum(courseTypeValues),
  classType: z.enum(classTypeValues),
  totalHours: z.coerce.number().int().min(1).max(9999),
  price: priceSchema,
  description: optionalText(500),
  status: z.enum(courseProductStatusValues),
});

export const courseProductIdSchema = z.string().cuid();

export type CourseProductFormValues = z.infer<typeof courseProductFormSchema>;
export type CourseTypeValue = (typeof courseTypeValues)[number];
export type ClassTypeValue = (typeof classTypeValues)[number];
export type CourseProductStatusValue = (typeof courseProductStatusValues)[number];

export function getCourseProductFormValues(formData: FormData) {
  return courseProductFormSchema.safeParse({
    name: formData.get("name"),
    subjectId: formData.get("subjectId"),
    gradeId: formData.get("gradeId"),
    courseType: formData.get("courseType"),
    classType: formData.get("classType"),
    totalHours: formData.get("totalHours"),
    price: formData.get("price"),
    description: formData.get("description"),
    status: formData.get("status"),
  });
}
