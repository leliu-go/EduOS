import { activityCreateSchema, wordCheckinSubmissionSchema } from "./activity-schema";

export type WordCheckinProgressInput = {
  targetWordCount: number;
  checkedWordCount: number;
};

export type WordCheckinProgress = {
  checkedWordCount: number;
  remainingWordCount: number;
  completionRate: number;
};

export function parseWordCheckinActivity(input: unknown) {
  return activityCreateSchema.parse(input);
}

export function parseWordCheckinSubmission(input: unknown) {
  return wordCheckinSubmissionSchema.parse(input);
}

export function calculateWordCheckinProgress(input: WordCheckinProgressInput): WordCheckinProgress {
  const targetWordCount = Math.max(1, Math.trunc(input.targetWordCount));
  const checkedWordCount = Math.min(
    targetWordCount,
    Math.max(0, Math.trunc(input.checkedWordCount)),
  );
  const remainingWordCount = Math.max(0, targetWordCount - checkedWordCount);

  return {
    checkedWordCount,
    remainingWordCount,
    completionRate: checkedWordCount / targetWordCount,
  };
}
