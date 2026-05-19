export type WeeklyScheduleOccurrenceInput = {
  lessonTitle: string;
  startAt: Date;
  endAt: Date;
  weeks: number;
};

export type WeeklyScheduleOccurrence = {
  title: string;
  startAt: Date;
  endAt: Date;
};

function addUtcDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);

  return nextDate;
}

export function buildWeeklyScheduleOccurrences(input: WeeklyScheduleOccurrenceInput) {
  return Array.from({ length: input.weeks }, (_, index): WeeklyScheduleOccurrence => {
    const weekOffset = index * 7;

    return {
      title: `${input.lessonTitle} 第${index + 1}讲`,
      startAt: addUtcDays(input.startAt, weekOffset),
      endAt: addUtcDays(input.endAt, weekOffset),
    };
  });
}
