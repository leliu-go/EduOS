import { z } from "zod";

export const resourceTypeValues = [
  "PPT",
  "HANDOUT",
  "VIDEO",
  "AUDIO",
  "WORKSHEET",
  "ANSWER",
  "EXPLANATION",
] as const;

export const resourceTypeLabels = {
  PPT: "课件 PPT",
  HANDOUT: "讲义",
  VIDEO: "视频",
  AUDIO: "音频",
  WORKSHEET: "练习",
  ANSWER: "答案",
  EXPLANATION: "解析",
} as const satisfies Record<(typeof resourceTypeValues)[number], string>;

export const resourceStatusLabels = {
  ACTIVE: "可用",
  ARCHIVED: "已归档",
} as const;

const allowedReturnPaths = ["/dashboard/resources", "/teacher/resources"] as const;

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

export const resourceFormSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    resourceType: z.enum(resourceTypeValues),
    description: optionalText(500),
    fileName: optionalText(160),
    fileUrl: optionalUrl(),
    courseProductId: optionalCuid(),
    classGroupId: optionalCuid(),
    lessonId: optionalCuid(),
    returnTo: z.enum(allowedReturnPaths).default("/dashboard/resources"),
  })
  .refine((values) => Boolean(values.courseProductId || values.classGroupId || values.lessonId), {
    message: "Resource must bind to a course, class, or lesson.",
    path: ["courseProductId"],
  });

export function getResourceFormValues(formData: FormData) {
  return resourceFormSchema.safeParse({
    title: formData.get("title"),
    resourceType: formData.get("resourceType"),
    description: formData.get("description"),
    fileName: formData.get("fileName"),
    fileUrl: formData.get("fileUrl"),
    courseProductId: formData.get("courseProductId"),
    classGroupId: formData.get("classGroupId"),
    lessonId: formData.get("lessonId"),
    returnTo: formData.get("returnTo") ?? undefined,
  });
}

export type ResourceTypeValue = (typeof resourceTypeValues)[number];
export type ResourceFormValues = z.infer<typeof resourceFormSchema>;
