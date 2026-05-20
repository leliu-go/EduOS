import { errorReasonLabels, errorReasonValues } from "./error-record-schema";

export type ErrorReason = (typeof errorReasonValues)[number];

export type ErrorReasonCountRow = {
  errorReason: ErrorReason;
  _count: {
    _all: number;
  };
};

export type ErrorReasonStat = {
  reason: ErrorReason;
  label: string;
  count: number;
};

export function buildErrorReasonStats(rows: ErrorReasonCountRow[]): ErrorReasonStat[] {
  const counts = new Map(rows.map((row) => [row.errorReason, row._count._all]));

  return errorReasonValues.map((reason) => ({
    reason,
    label: errorReasonLabels[reason],
    count: counts.get(reason) ?? 0,
  }));
}
