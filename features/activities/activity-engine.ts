import { canManageActivity, canSubmitWordCheckIn, canViewActivity } from "./activity-policy";
import {
  activityCreateSchema,
  wordCheckinSubmissionSchema,
  type ActivityCreateValues,
  type ActivityStatus,
} from "./activity-schema";
import { calculateWordCheckinProgress } from "./word-checkin";

export type ActivityEngineActor = {
  tenantId: string;
  roleKey: "SUPER_ADMIN" | "ORG_ADMIN" | "CAMPUS_ADMIN" | "ACADEMIC" | "FINANCE" | "TEACHER" | "STUDENT" | "PARENT";
  userId: string;
};

export type ActivityAssignmentTarget =
  | { targetType: "CAMPUS"; campusId: string }
  | { targetType: "CLASS_GROUP"; classGroupId: string }
  | { targetType: "STUDENT"; studentId: string };

export type WordCheckinActivityDraft = {
  tenantId: string;
  title: string;
  description?: string | null;
  type: "WORD_CHECKIN";
  status: ActivityStatus;
  startsAt: Date;
  endsAt: Date;
  wordListResourceId?: string | null;
  targetWordCount: number;
  dailyCheckInLimit: number;
  instructions?: string | null;
  assignment: ActivityAssignmentTarget;
};

export type ActivityCheckInAttempt = {
  allowed: boolean;
  reason?: "forbidden" | "daily_limit_reached";
  checkedWordCount?: number;
  progress?: ReturnType<typeof calculateWordCheckinProgress>;
};

export function createWordCheckinActivityDraft(
  actor: ActivityEngineActor,
  input: unknown,
): WordCheckinActivityDraft {
  const values: ActivityCreateValues = activityCreateSchema.parse(input);

  if (!canManageActivity(actor, actor.tenantId)) {
    throw new Error("Actor cannot manage activities in this tenant.");
  }

  return {
    tenantId: actor.tenantId,
    title: values.title,
    description: values.description ?? null,
    type: "WORD_CHECKIN",
    status: values.status,
    startsAt: values.startsAt,
    endsAt: values.endsAt,
    wordListResourceId: values.config.wordListResourceId ?? null,
    targetWordCount: values.config.targetWordCount,
    dailyCheckInLimit: values.config.dailyCheckInLimit,
    instructions: values.config.instructions ?? null,
    assignment: values.assignment,
  };
}

export function publishActivity(
  actor: ActivityEngineActor,
  activity: { tenantId: string; status: ActivityStatus },
) {
  if (!canManageActivity(actor, activity.tenantId)) {
    return { allowed: false as const, reason: "forbidden" as const };
  }

  if (activity.status === "ENDED") {
    return { allowed: false as const, reason: "ended" as const };
  }

  return {
    allowed: true as const,
    status: "PUBLISHED" as const,
    publishedAt: new Date(),
  };
}

export function recordWordCheckinAttempt(
  actor: ActivityEngineActor,
  activity: {
    tenantId: string;
    status: ActivityStatus;
    assignedStudentUserIds: readonly string[];
    targetWordCount: number;
    dailyCheckInLimit: number;
  },
  input: unknown,
  todaysCheckInCount: number,
): ActivityCheckInAttempt {
  if (!canSubmitWordCheckIn(actor, activity)) {
    return {
      allowed: false,
      reason: "forbidden",
    };
  }

  if (todaysCheckInCount >= activity.dailyCheckInLimit) {
    return {
      allowed: false,
      reason: "daily_limit_reached",
    };
  }

  const submission = wordCheckinSubmissionSchema.parse(input);
  const progress = calculateWordCheckinProgress({
    targetWordCount: activity.targetWordCount,
    checkedWordCount: submission.checkedWordCount,
  });

  return {
    allowed: true,
    checkedWordCount: submission.checkedWordCount,
    progress,
  };
}

export function canViewActivityProgress(
  actor: ActivityEngineActor,
  activity: {
    tenantId: string;
    status: ActivityStatus;
    teacherUserIds?: readonly string[];
    assignedStudentUserIds?: readonly string[];
    assignedGuardianUserIds?: readonly string[];
  },
) {
  return canViewActivity(actor, activity);
}
