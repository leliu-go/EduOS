export type CourseAccountBalanceInput = {
  purchasedHours: number;
  giftHours: number;
  usedHours: number;
  frozenHours: number;
};

export type CourseAccountBalanceOptions = {
  allowNegativeBalance?: boolean;
};

export function calculateCourseAccountBalance(
  account: CourseAccountBalanceInput,
  options: CourseAccountBalanceOptions = {},
) {
  const totalHours = account.purchasedHours + account.giftHours;
  const rawRemainingHours = totalHours - account.usedHours - account.frozenHours;
  const remainingHours = options.allowNegativeBalance
    ? rawRemainingHours
    : Math.max(rawRemainingHours, 0);

  return {
    totalHours,
    remainingHours,
    rawRemainingHours,
    isNegative: rawRemainingHours < 0,
  };
}
