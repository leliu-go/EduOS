import { z } from "zod";

export const teacherStatusValues = ["ACTIVE", "INACTIVE", "ON_LEAVE", "RESIGNED"] as const;

export const teacherStatusLabels = {
  ACTIVE: "在职",
  INACTIVE: "停用",
  ON_LEAVE: "休假",
  RESIGNED: "离职",
} as const satisfies Record<(typeof teacherStatusValues)[number], string>;

function optionalText(maxLength: number) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maxLength).optional(),
  );
}

function splitList(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const listSchema = z.preprocess(splitList, z.array(z.string().min(1).max(40)).min(1).max(20));

const optionalEmailSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().email().max(120).optional(),
);

export const teacherFormSchema = z.object({
  name: z.string().trim().min(1).max(50),
  phone: z.string().trim().min(1).max(30),
  email: optionalEmailSchema,
  subjects: listSchema,
  grades: listSchema,
  status: z.enum(teacherStatusValues),
  availableTimeNotes: optionalText(500),
  qualificationFileName: optionalText(120),
  notes: optionalText(1000),
});

export const teacherIdSchema = z.string().cuid();

export type TeacherFormValues = z.infer<typeof teacherFormSchema>;
export type TeacherStatusValue = (typeof teacherStatusValues)[number];

export function getTeacherFormValues(formData: FormData) {
  return teacherFormSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    subjects: formData.get("subjects"),
    grades: formData.get("grades"),
    status: formData.get("status"),
    availableTimeNotes: formData.get("availableTimeNotes"),
    qualificationFileName: formData.get("qualificationFileName"),
    notes: formData.get("notes"),
  });
}

export function formatTeacherList(values: string[]) {
  return values.length > 0 ? values.join("、") : "未填写";
}
