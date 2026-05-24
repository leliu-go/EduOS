import { z } from "zod";

export const configStatusValues = ["ACTIVE", "INACTIVE"] as const;

export const configStatusLabels = {
  ACTIVE: "启用",
  INACTIVE: "停用",
} as const satisfies Record<(typeof configStatusValues)[number], string>;

function optionalText(maxLength: number) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maxLength).optional(),
  );
}

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const subjectConfigSchema = z.object({
  name: z.string().trim().min(1).max(60),
  code: optionalText(40),
  status: z.enum(configStatusValues),
});

export const gradeConfigSchema = z.object({
  name: z.string().trim().min(1).max(60),
  sortOrder: z.coerce.number().int().min(0).max(999),
  status: z.enum(configStatusValues),
});

export const termConfigSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    startsAt: dateStringSchema.transform((value) => new Date(`${value}T00:00:00.000Z`)),
    endsAt: dateStringSchema.transform((value) => new Date(`${value}T00:00:00.000Z`)),
    status: z.enum(configStatusValues),
  })
  .refine((value) => value.endsAt >= value.startsAt, {
    path: ["endsAt"],
    message: "学期结束日期必须晚于开始日期。",
  });

export type SubjectConfigValues = z.infer<typeof subjectConfigSchema>;
export type GradeConfigValues = z.infer<typeof gradeConfigSchema>;
export type TermConfigValues = z.infer<typeof termConfigSchema>;
export type ConfigStatusValue = (typeof configStatusValues)[number];

export function getSubjectConfigValues(formData: FormData) {
  return subjectConfigSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    status: formData.get("status"),
  });
}

export function getGradeConfigValues(formData: FormData) {
  return gradeConfigSchema.safeParse({
    name: formData.get("name"),
    sortOrder: formData.get("sortOrder"),
    status: formData.get("status"),
  });
}

export function getTermConfigValues(formData: FormData) {
  return termConfigSchema.safeParse({
    name: formData.get("name"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    status: formData.get("status"),
  });
}

export function formatConfigDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
