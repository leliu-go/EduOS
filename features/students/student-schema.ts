import { z } from "zod";

export const studentGenderValues = ["MALE", "FEMALE", "OTHER"] as const;
export const studentStatusValues = ["ACTIVE", "PAUSED", "GRADUATED", "WITHDRAWN"] as const;

export const studentGenderLabels = {
  MALE: "男",
  FEMALE: "女",
  OTHER: "其他",
} as const satisfies Record<(typeof studentGenderValues)[number], string>;

export const studentStatusLabels = {
  ACTIVE: "在读",
  PAUSED: "暂停",
  GRADUATED: "结课",
  WITHDRAWN: "退学",
} as const satisfies Record<(typeof studentStatusValues)[number], string>;

function optionalText(maxLength: number) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maxLength).optional(),
  );
}

const optionalGenderSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.enum(studentGenderValues).optional(),
);

const birthdaySchema = z
  .preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  )
  .transform((value) => (value ? new Date(`${value}T00:00:00.000Z`) : undefined));

export const studentFormSchema = z.object({
  name: z.string().trim().min(1).max(50),
  gender: optionalGenderSchema,
  birthday: birthdaySchema,
  grade: z.string().trim().min(1).max(40),
  school: optionalText(100),
  status: z.enum(studentStatusValues),
  notes: optionalText(1000),
});

export const studentIdSchema = z.string().cuid();

export type StudentFormValues = z.infer<typeof studentFormSchema>;
export type StudentStatusValue = (typeof studentStatusValues)[number];
export type StudentGenderValue = (typeof studentGenderValues)[number];

export function getStudentFormValues(formData: FormData) {
  return studentFormSchema.safeParse({
    name: formData.get("name"),
    gender: formData.get("gender"),
    birthday: formData.get("birthday"),
    grade: formData.get("grade"),
    school: formData.get("school"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  });
}

export function formatStudentBirthday(birthday?: Date | null) {
  return birthday ? birthday.toISOString().slice(0, 10) : "";
}
