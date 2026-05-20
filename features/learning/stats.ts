type LearningCheckInDay = {
  date: string;
  total: number;
  completed: number;
};

function previousDateKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);

  date.setUTCDate(date.getUTCDate() - 1);

  return date.toISOString().slice(0, 10);
}

export function calculateLearningCheckInStats(days: LearningCheckInDay[], today: string) {
  const totals = days.reduce(
    (sum, day) => ({
      total: sum.total + day.total,
      completed: sum.completed + day.completed,
    }),
    { total: 0, completed: 0 },
  );
  const completionRate = totals.total > 0 ? Math.round((totals.completed / totals.total) * 100) : 0;
  const byDate = new Map(days.map((day) => [day.date, day]));
  let currentDate = today;
  let currentStreak = 0;

  while (true) {
    const day = byDate.get(currentDate);

    if (!day || day.total === 0 || day.completed < day.total) {
      break;
    }

    currentStreak += 1;
    currentDate = previousDateKey(currentDate);
  }

  return {
    completionRate,
    currentStreak,
  };
}
