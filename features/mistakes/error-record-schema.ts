export const errorReasonValues = [
  "CONCEPT_UNCLEAR",
  "CALCULATION_ERROR",
  "READING_ERROR",
  "METHOD_ERROR",
  "CARELESS",
  "OTHER",
] as const;

export const errorReasonLabels = {
  CONCEPT_UNCLEAR: "概念不清",
  CALCULATION_ERROR: "计算错误",
  READING_ERROR: "审题错误",
  METHOD_ERROR: "方法错误",
  CARELESS: "粗心失误",
  OTHER: "其他",
} as const satisfies Record<(typeof errorReasonValues)[number], string>;
