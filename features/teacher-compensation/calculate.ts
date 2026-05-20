export type CompensationClassType = "OFFLINE" | "ONLINE" | "HYBRID";
export type TeacherCompensationCalculationMode = "LESSON" | "HOUR" | "STUDENT_COUNT" | "CLASS_TYPE";

type DecimalLike = {
  toString(): string;
};

export type TeacherCompensationRuleInput = {
  calculationMode: TeacherCompensationCalculationMode;
  rateAmount: number | DecimalLike;
  classTypeRates?: Partial<Record<CompensationClassType, number | DecimalLike>>;
};

export type TeacherCompensationContext = {
  lessonCount: number;
  hours: number;
  studentCount: number;
  classType: CompensationClassType;
};

function toNumber(value: number | DecimalLike) {
  const amount = typeof value === "number" ? value : Number(value.toString());

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return amount;
}

function positive(value: number) {
  return Math.max(0, value);
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateTeacherCompensation(
  rule: TeacherCompensationRuleInput,
  context: TeacherCompensationContext,
) {
  const rateAmount = toNumber(rule.rateAmount);

  switch (rule.calculationMode) {
    case "LESSON":
      return roundCurrency(rateAmount * positive(context.lessonCount));
    case "HOUR":
      return roundCurrency(rateAmount * positive(context.hours));
    case "STUDENT_COUNT":
      return roundCurrency(rateAmount * positive(context.studentCount));
    case "CLASS_TYPE":
      return roundCurrency(toNumber(rule.classTypeRates?.[context.classType] ?? rateAmount));
  }
}
