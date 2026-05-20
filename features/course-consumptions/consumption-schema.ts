import { z } from "zod";

export const courseConsumptionReversalSchema = z.object({
  courseConsumptionId: z.string().cuid(),
  reason: z.string().trim().min(2).max(200),
});

export function getCourseConsumptionReversalFormValues(formData: FormData) {
  return courseConsumptionReversalSchema.safeParse({
    courseConsumptionId: formData.get("courseConsumptionId"),
    reason: formData.get("reason"),
  });
}

export type CourseConsumptionReversalFormValues = z.infer<typeof courseConsumptionReversalSchema>;
