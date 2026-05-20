export type HomeworkReminderStatus = "OVERDUE" | "PENDING";

export const homeworkReminderStatusLabels = {
  OVERDUE: "已逾期",
  PENDING: "待提交",
} as const satisfies Record<HomeworkReminderStatus, string>;

export function needsStudentAction(latestSubmission: { status: string } | null | undefined) {
  return !latestSubmission || latestSubmission.status === "NEEDS_REVISION";
}

export function getHomeworkReminderStatus(
  input: { dueAt: Date; needsStudentAction: boolean },
  now = new Date(),
): HomeworkReminderStatus | null {
  if (!input.needsStudentAction) {
    return null;
  }

  return input.dueAt.getTime() < now.getTime() ? "OVERDUE" : "PENDING";
}
