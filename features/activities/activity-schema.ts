import { z } from "zod";

export const activityTypeValues = ["WORD_CHECKIN"] as const;
export const activityStatusValues = ["DRAFT", "PUBLISHED", "PAUSED", "ENDED"] as const;

function optionalCuid() {
  return z.preprocess(
    (value) =>
      value === null || (typeof value === "string" && value.trim() === "") ? undefined : value,
    z.string().cuid().optional(),
  );
}

function optionalText(maxLength: number) {
  return z.preprocess(
    (value) =>
      value === null || (typeof value === "string" && value.trim() === "") ? undefined : value,
    z.string().trim().max(maxLength).optional(),
  );
}

function dateValue() {
  return z.preprocess((value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) {
        return value;
      }

      const parsed = new Date(`${trimmed}T00:00:00.000Z`);

      return Number.isNaN(parsed.getTime()) ? value : parsed;
    }

    return value;
  }, z.date());
}

export const wordCheckinActivityConfigSchema = z.object({
  targetWordCount: z.coerce.number().int().min(1).max(5000),
  dailyCheckInLimit: z.coerce.number().int().min(1).max(10).default(1),
  wordListResourceId: optionalCuid(),
  instructions: optionalText(1000),
});

const classGroupAssignmentSchema = z
  .object({
    targetType: z.literal("CLASS_GROUP"),
    classGroupId: z.string().cuid(),
  })
  .strict();

const studentAssignmentSchema = z
  .object({
    targetType: z.literal("STUDENT"),
    studentId: z.string().cuid(),
  })
  .strict();

export const activityAssignmentSchema = z.discriminatedUnion("targetType", [
  classGroupAssignmentSchema,
  studentAssignmentSchema,
]);

export const activityCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: optionalText(2000),
    type: z.literal("WORD_CHECKIN"),
    status: z.enum(activityStatusValues).default("DRAFT"),
    startsAt: dateValue(),
    endsAt: dateValue(),
    assignment: activityAssignmentSchema,
    config: wordCheckinActivityConfigSchema,
  })
  .refine((values) => values.endsAt >= values.startsAt, {
    path: ["endsAt"],
    message: "Activity end date must be on or after the start date.",
  });

export const wordCheckinSubmissionSchema = z.object({
  activityId: z.string().cuid(),
  checkedWordCount: z.coerce.number().int().min(1).max(5000),
  note: optionalText(1000),
});

export type ActivityType = (typeof activityTypeValues)[number];
export type ActivityStatus = (typeof activityStatusValues)[number];
export type WordCheckinActivityConfig = z.infer<typeof wordCheckinActivityConfigSchema>;
export type ActivityCreateValues = z.infer<typeof activityCreateSchema>;
export type WordCheckinSubmissionValues = z.infer<typeof wordCheckinSubmissionSchema>;
