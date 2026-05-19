export const scheduleCalendarViews = ["day", "week", "list"] as const;

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

  const weekStart = getWeekStart(startDate);

  return {
    startAt: weekStart,
    endAt: addUtcDays(weekStart, 7),
  };
}

export function getShiftedScheduleDate(search: ScheduleCalendarSearch, direction: -1 | 1) {
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
