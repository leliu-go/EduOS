export const scheduleCalendarViews = ["day", "week", "month", "list"] as const;

export type ScheduleCalendarView = (typeof scheduleCalendarViews)[number];

export type ScheduleCalendarFilters = {
  campusId?: string;
  teacherId?: string;
  roomId?: string;
  classGroupId?: string;
};

export type ScheduleCalendarSearch = {
  view: ScheduleCalendarView;
  date: string;
  filters: ScheduleCalendarFilters;
};

const filterKeys = ["campusId", "teacherId", "roomId", "classGroupId"] as const;

function getStringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function isScheduleCalendarView(value: string): value is ScheduleCalendarView {
  return scheduleCalendarViews.includes(value as ScheduleCalendarView);
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return formatDateInput(new Date(`${value}T00:00:00.000Z`)) === value;
}

function parseDateInput(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function addUtcDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);

  return nextDate;
}

function getWeekStart(date: Date) {
  const weekday = date.getUTCDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;

  return addUtcDays(date, -daysFromMonday);
}

function getMonthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function getDaysInUtcMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function addUtcMonths(date: Date, months: number) {
  const targetMonthStart = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
  const day = Math.min(
    date.getUTCDate(),
    getDaysInUtcMonth(targetMonthStart.getUTCFullYear(), targetMonthStart.getUTCMonth()),
  );
  targetMonthStart.setUTCDate(day);

  return targetMonthStart;
}

export function getScheduleMonthGridDateInputs(dateInput: string) {
  const monthStart = getMonthStart(parseDateInput(dateInput));
  const weekday = monthStart.getUTCDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  const gridStart = addUtcDays(monthStart, -daysFromMonday);

  return Array.from({ length: 42 }, (_, index) => formatDateInput(addUtcDays(gridStart, index)));
}

export function getScheduleCalendarSearch(
  params: Record<string, string | string[] | undefined>,
  fallbackDate = new Date(),
): ScheduleCalendarSearch {
  const viewParam = getStringParam(params.view);
  const dateParam = getStringParam(params.date);
  const filters: ScheduleCalendarFilters = {};

  for (const filterKey of filterKeys) {
    const value = getStringParam(params[filterKey]);

    if (value && value !== "all") {
      filters[filterKey] = value;
    }
  }

  return {
    view: isScheduleCalendarView(viewParam) ? viewParam : "week",
    date: isDateInput(dateParam) ? dateParam : formatDateInput(fallbackDate),
    filters,
  };
}

export function getScheduleCalendarWindow(search: ScheduleCalendarSearch) {
  const startDate = parseDateInput(search.date);

  if (search.view === "day") {
    return {
      startAt: startDate,
      endAt: addUtcDays(startDate, 1),
    };
  }

  if (search.view === "list") {
    return {
      startAt: startDate,
      endAt: addUtcDays(startDate, 30),
    };
  }

  if (search.view === "month") {
    const monthStart = getMonthStart(startDate);

    return {
      startAt: monthStart,
      endAt: addUtcMonths(monthStart, 1),
    };
  }

  const weekStart = getWeekStart(startDate);

  return {
    startAt: weekStart,
    endAt: addUtcDays(weekStart, 7),
  };
}

export function getShiftedScheduleDate(search: ScheduleCalendarSearch, direction: -1 | 1) {
  if (search.view === "month") {
    return formatDateInput(addUtcMonths(parseDateInput(search.date), direction));
  }

  const step = search.view === "day" ? 1 : search.view === "week" ? 7 : 30;

  return formatDateInput(addUtcDays(parseDateInput(search.date), step * direction));
}

export function getScheduleCalendarHref(search: ScheduleCalendarSearch) {
  const searchParams = new URLSearchParams();

  searchParams.set("view", search.view);
  searchParams.set("date", search.date);

  for (const filterKey of filterKeys) {
    const value = search.filters[filterKey];

    if (value) {
      searchParams.set(filterKey, value);
    }
  }

  return `/dashboard/scheduling?${searchParams.toString()}`;
}
