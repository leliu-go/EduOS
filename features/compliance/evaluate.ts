export type ComplianceRuleType =
  | "FORBIDDEN_SCHEDULING_WINDOW"
  | "MAX_PREPAID_HOURS"
  | "CONTRACT_REQUIRED"
  | "TEACHER_QUALIFICATION_REQUIRED";

export type ComplianceRuleSeverity = "WARN" | "BLOCK";

export type ComplianceRuleInput = {
  id: string;
  ruleType: ComplianceRuleType;
  severity: ComplianceRuleSeverity;
  configJson: unknown;
  status?: "ACTIVE" | "INACTIVE";
};

export type ComplianceContext = {
  scheduleStartAt?: Date;
  scheduleEndAt?: Date;
  prepaidHours?: number;
  contractRequired?: boolean;
  hasSignedContract?: boolean;
  teacherQualificationFileName?: string | null;
};

export type ComplianceFinding = {
  ruleId: string;
  ruleType: ComplianceRuleType;
  severity: ComplianceRuleSeverity;
  message: string;
};

type ForbiddenWindow = {
  start: string;
  end: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function parseTimeToMinutes(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());

  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function dateToLocalMinutes(value: Date) {
  return value.getHours() * 60 + value.getMinutes();
}

function minuteInWindow(minute: number, window: ForbiddenWindow) {
  const start = parseTimeToMinutes(window.start);
  const end = parseTimeToMinutes(window.end);

  if (start === null || end === null || start === end) {
    return false;
  }

  if (start < end) {
    return minute >= start && minute < end;
  }

  return minute >= start || minute < end;
}

function getForbiddenWindows(configJson: unknown): ForbiddenWindow[] {
  const windows = asRecord(configJson).windows;

  if (!Array.isArray(windows)) {
    return [];
  }

  return windows.filter((window): window is ForbiddenWindow => {
    const value = asRecord(window);

    return typeof value.start === "string" && typeof value.end === "string";
  });
}

function violatesForbiddenSchedule(rule: ComplianceRuleInput, context: ComplianceContext) {
  if (!context.scheduleStartAt || !context.scheduleEndAt) {
    return false;
  }

  const startMinute = dateToLocalMinutes(context.scheduleStartAt);
  const endMinute = dateToLocalMinutes(context.scheduleEndAt);

  return getForbiddenWindows(rule.configJson).some(
    (window) => minuteInWindow(startMinute, window) || minuteInWindow(endMinute, window),
  );
}

function violatesMaxPrepaidHours(rule: ComplianceRuleInput, context: ComplianceContext) {
  const maxHours = asRecord(rule.configJson).maxHours;

  return (
    typeof maxHours === "number" &&
    typeof context.prepaidHours === "number" &&
    context.prepaidHours > maxHours
  );
}

function violatesContractRequired(context: ComplianceContext) {
  return context.contractRequired === true && context.hasSignedContract !== true;
}

function violatesTeacherQualification(context: ComplianceContext) {
  return !context.teacherQualificationFileName?.trim();
}

function buildMessage(ruleType: ComplianceRuleType) {
  switch (ruleType) {
    case "FORBIDDEN_SCHEDULING_WINDOW":
      return "排课时间落在禁排时段内";
    case "MAX_PREPAID_HOURS":
      return "预付课时超过合规上限";
    case "CONTRACT_REQUIRED":
      return "报名要求合同但尚未完成签署";
    case "TEACHER_QUALIFICATION_REQUIRED":
      return "教师资质文件缺失";
  }
}

export function evaluateComplianceRules(
  rules: ComplianceRuleInput[],
  context: ComplianceContext,
): ComplianceFinding[] {
  return rules.flatMap((rule) => {
    if (rule.status === "INACTIVE") {
      return [];
    }

    const violated =
      (rule.ruleType === "FORBIDDEN_SCHEDULING_WINDOW" &&
        violatesForbiddenSchedule(rule, context)) ||
      (rule.ruleType === "MAX_PREPAID_HOURS" && violatesMaxPrepaidHours(rule, context)) ||
      (rule.ruleType === "CONTRACT_REQUIRED" && violatesContractRequired(context)) ||
      (rule.ruleType === "TEACHER_QUALIFICATION_REQUIRED" && violatesTeacherQualification(context));

    if (!violated) {
      return [];
    }

    return [
      {
        ruleId: rule.id,
        ruleType: rule.ruleType,
        severity: rule.severity,
        message: buildMessage(rule.ruleType),
      },
    ];
  });
}
