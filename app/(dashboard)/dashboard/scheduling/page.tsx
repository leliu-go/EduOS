import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  MapPin,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getScheduleCalendarHref,
  getScheduleCalendarSearch,
  getScheduleMonthGridDateInputs,
  getShiftedScheduleDate,
  type ScheduleCalendarSearch,
} from "@/features/scheduling/calendar";
import { getScheduleCalendarData, type ScheduleCalendarItem } from "@/features/scheduling/queries";
import { ScheduleBatchDialog } from "@/features/scheduling/schedule-batch-dialog";
import { ScheduleChangeActions } from "@/features/scheduling/schedule-change-actions";
import { ScheduleCreateDialog } from "@/features/scheduling/schedule-create-dialog";
import { scheduleStatusLabels } from "@/features/scheduling/schedule-schema";
import { requirePermission } from "@/lib/rbac/require-permission";
import { cn } from "@/lib/utils";

type SchedulingCalendarPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ScheduleCalendarData = Awaited<ReturnType<typeof getScheduleCalendarData>>;
type ScheduleCalendarRoom = ScheduleCalendarData["options"]["rooms"][number];

const viewLabels = {
  day: "日",
  week: "周",
  month: "月",
  list: "列表",
} as const;

const errorMessages = {
  invalid_input: "排课信息不完整，请检查班级、老师、教室和时间。",
  invalid_scope: "请选择当前机构下有效的班级、老师和教室。",
  schedule_conflict: "排课存在时间冲突，请调整老师、教室或时间后再提交。",
} as const;

const conflictMessages = {
  teacher_time: "老师在该时间段已有排课。",
  room_time: "教室在该时间段已被占用。",
  student_time: "班级学生在该时间段已有其他排课。",
  campus_business_hours: "排课时间不在校区营业时间内。",
  class_group_duplicate: "班级在该时间段已有课程。",
} as const;

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);

  return nextDate;
}

function isSameUtcMonth(date: Date, monthStart: Date) {
  return (
    date.getUTCFullYear() === monthStart.getUTCFullYear() &&
    date.getUTCMonth() === monthStart.getUTCMonth()
  );
}

function formatWindowEnd(value: Date) {
  return formatDate(addUtcDays(value, -1));
}

function formatTime(value: Date) {
  return value.toISOString().slice(11, 16);
}

function formatScheduleTime(schedule: ScheduleCalendarItem) {
  return `${formatDate(schedule.startAt)} ${formatTime(schedule.startAt)}-${formatTime(schedule.endAt)}`;
}

function getScheduleChangePayload(schedule: ScheduleCalendarItem) {
  return {
    id: schedule.id,
    roomId: schedule.roomId,
    startAt: schedule.startAt.toISOString(),
    endAt: schedule.endAt.toISOString(),
    status: schedule.status,
  };
}

function getConflictMessages(value: string | string[] | undefined) {
  const rawValue = typeof value === "string" ? value : "";

  return rawValue
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry): entry is keyof typeof conflictMessages => entry in conflictMessages)
    .map((entry) => conflictMessages[entry]);
}

function getHrefWithView(search: ScheduleCalendarSearch, view: ScheduleCalendarSearch["view"]) {
  return getScheduleCalendarHref({
    ...search,
    view,
  });
}

function getHrefWithDate(search: ScheduleCalendarSearch, date: string) {
  return getScheduleCalendarHref({
    ...search,
    date,
  });
}

function getHrefWithDayView(search: ScheduleCalendarSearch, date: string) {
  return getScheduleCalendarHref({
    ...search,
    view: "day",
    date,
  });
}

function getNavigationLabel(search: ScheduleCalendarSearch, direction: -1 | 1) {
  if (search.view === "day") {
    return direction === -1 ? "前一天" : "后一天";
  }

  if (search.view === "week") {
    return direction === -1 ? "上一周" : "下一周";
  }

  if (search.view === "month") {
    return direction === -1 ? "上个月" : "下个月";
  }

  return direction === -1 ? "上一段" : "下一段";
}

function getWeekDays(startAt: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    return formatDate(addUtcDays(startAt, index));
  });
}

function getSchedulesByDate(schedules: ScheduleCalendarItem[]) {
  const schedulesByDate = new Map<string, ScheduleCalendarItem[]>();

  for (const schedule of schedules) {
    const date = formatDate(schedule.startAt);
    const dailySchedules = schedulesByDate.get(date) ?? [];
    dailySchedules.push(schedule);
    schedulesByDate.set(date, dailySchedules);
  }

  return schedulesByDate;
}

function ScheduleEvent({
  schedule,
  rooms,
  compact = false,
}: {
  schedule: ScheduleCalendarItem;
  rooms: ScheduleCalendarRoom[];
  compact?: boolean;
}) {
  return (
    <div className="rounded-md border bg-card px-3 py-2 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={cn("font-medium text-foreground", compact ? "text-xs" : "text-sm")}>
            {schedule.lesson?.title ?? schedule.classGroup.name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatTime(schedule.startAt)}-{formatTime(schedule.endAt)}
          </p>
        </div>
        <Badge variant="secondary">{scheduleStatusLabels[schedule.status]}</Badge>
      </div>
      <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
        <span>{schedule.classGroup.name}</span>
        <span>
          {schedule.teacher.name} · {schedule.campus.name}/{schedule.room.name}
        </span>
      </div>
      <ScheduleChangeActions schedule={getScheduleChangePayload(schedule)} rooms={rooms} />
    </div>
  );
}

function DayCalendar({
  schedules,
  rooms,
}: {
  schedules: ScheduleCalendarItem[];
  rooms: ScheduleCalendarRoom[];
}) {
  return (
    <div className="grid gap-3">
      {schedules.map((schedule) => (
        <ScheduleEvent key={schedule.id} schedule={schedule} rooms={rooms} />
      ))}
    </div>
  );
}

function WeekCalendar({
  schedules,
  rooms,
  startAt,
}: {
  schedules: ScheduleCalendarItem[];
  rooms: ScheduleCalendarRoom[];
  startAt: Date;
}) {
  const schedulesByDate = getSchedulesByDate(schedules);

  return (
    <div className="grid gap-3 xl:grid-cols-7">
      {getWeekDays(startAt).map((date) => {
        const dailySchedules = schedulesByDate.get(date) ?? [];

        return (
          <div key={date} className="min-h-36 rounded-md border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{date.slice(5)}</p>
              <span className="text-xs text-muted-foreground">{dailySchedules.length} 节</span>
            </div>
            <div className="mt-3 grid gap-2">
              {dailySchedules.length > 0 ? (
                dailySchedules.map((schedule) => (
                  <ScheduleEvent key={schedule.id} schedule={schedule} rooms={rooms} compact />
                ))
              ) : (
                <p className="rounded-md border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                  无排课
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthScheduleSummary({ schedule }: { schedule: ScheduleCalendarItem }) {
  return (
    <div className="rounded-md border bg-background/70 px-2 py-1.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">
          {formatTime(schedule.startAt)} {schedule.lesson?.title ?? schedule.classGroup.name}
        </span>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {scheduleStatusLabels[schedule.status]}
        </Badge>
      </div>
      <p className="mt-1 truncate text-muted-foreground">
        {schedule.classGroup.name} · {schedule.teacher.name}
      </p>
    </div>
  );
}

function MonthCalendar({
  schedules,
  search,
  startAt,
}: {
  schedules: ScheduleCalendarItem[];
  search: ScheduleCalendarSearch;
  startAt: Date;
}) {
  const schedulesByDate = getSchedulesByDate(schedules);
  const monthDates = getScheduleMonthGridDateInputs(formatDate(startAt)).map(
    (date) => new Date(`${date}T00:00:00.000Z`),
  );
  const currentMonthDates = monthDates.filter((date) => isSameUtcMonth(date, startAt));
  const mobileDates = currentMonthDates;

  return (
    <div className="grid gap-4">
      <div
        data-testid="scheduling-month-calendar-desktop"
        className="hidden overflow-hidden rounded-lg border bg-card md:block"
      >
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground">
          {["一", "二", "三", "四", "五", "六", "日"].map((label) => (
            <div key={label} className="px-3 py-2">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {monthDates.map((date) => {
            const dateInput = formatDate(date);
            const dailySchedules = schedulesByDate.get(dateInput) ?? [];
            const visibleSchedules = dailySchedules.slice(0, 3);
            const hiddenCount = Math.max(dailySchedules.length - visibleSchedules.length, 0);
            const inCurrentMonth = isSameUtcMonth(date, startAt);

            if (!inCurrentMonth) {
              return (
                <div
                  key={dateInput}
                  aria-hidden="true"
                  className="min-h-36 border-r border-b bg-muted/20 p-2 last:border-r-0"
                />
              );
            }

            return (
              <div
                key={dateInput}
                data-testid={`scheduling-month-cell-${dateInput}`}
                className="min-h-36 border-r border-b p-2 last:border-r-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    <Link
                      href={getHrefWithDayView(search, dateInput)}
                      data-testid={`scheduling-month-day-${dateInput}`}
                    >
                      {date.getUTCDate()}
                    </Link>
                  </Button>
                  {dailySchedules.length > 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {dailySchedules.length} 节
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 grid gap-1.5">
                  {visibleSchedules.map((schedule) => (
                    <MonthScheduleSummary key={schedule.id} schedule={schedule} />
                  ))}
                  {hiddenCount > 0 ? (
                    <Button asChild variant="link" size="sm" className="h-auto justify-start px-0">
                      <Link href={getHrefWithDayView(search, dateInput)}>
                        还有 {hiddenCount} 节
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div data-testid="scheduling-month-calendar-mobile" className="grid gap-3 md:hidden">
        {mobileDates.map((date) => {
          const dateInput = formatDate(date);
          const dailySchedules = schedulesByDate.get(dateInput) ?? [];
          const visibleSchedules = dailySchedules.slice(0, 3);
          const hiddenCount = Math.max(dailySchedules.length - visibleSchedules.length, 0);

          return (
            <div key={dateInput} className="rounded-lg border bg-card p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{dateInput}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dailySchedules.length > 0 ? `${dailySchedules.length} 节课` : "暂无排课"}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={getHrefWithDayView(search, dateInput)}
                    data-testid={`scheduling-month-day-${dateInput}`}
                  >
                    查看当天
                  </Link>
                </Button>
              </div>
              {visibleSchedules.length > 0 ? (
                <div className="mt-3 grid gap-2">
                  {visibleSchedules.map((schedule) => (
                    <MonthScheduleSummary key={schedule.id} schedule={schedule} />
                  ))}
                  {hiddenCount > 0 ? (
                    <Button asChild variant="link" size="sm" className="h-auto justify-start px-0">
                      <Link href={getHrefWithDayView(search, dateInput)}>
                        还有 {hiddenCount} 节
                      </Link>
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListCalendar({
  schedules,
  rooms,
}: {
  schedules: ScheduleCalendarItem[];
  rooms: ScheduleCalendarRoom[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <div className="min-w-[920px]">
        <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr_auto_12rem] gap-3 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>时间</span>
          <span>班级</span>
          <span>老师</span>
          <span>教室</span>
          <span>状态</span>
          <span>操作</span>
        </div>
        <div className="divide-y">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="grid grid-cols-[1.3fr_1fr_1fr_1fr_auto_12rem] gap-3 px-4 py-3 text-sm"
            >
              <span className="text-foreground">{formatScheduleTime(schedule)}</span>
              <span className="text-muted-foreground">{schedule.classGroup.name}</span>
              <span className="text-muted-foreground">{schedule.teacher.name}</span>
              <span className="text-muted-foreground">
                {schedule.campus.name}/{schedule.room.name}
              </span>
              <Badge variant="secondary">{scheduleStatusLabels[schedule.status]}</Badge>
              <ScheduleChangeActions schedule={getScheduleChangePayload(schedule)} rooms={rooms} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderCalendarView({
  calendarData,
  search,
}: {
  calendarData: ScheduleCalendarData;
  search: ScheduleCalendarSearch;
}) {
  if (search.view === "day") {
    return calendarData.schedules.length > 0 ? (
      <DayCalendar schedules={calendarData.schedules} rooms={calendarData.options.rooms} />
    ) : (
      <EmptyState title="暂无排课" description="当前日期还没有课程安排。" />
    );
  }

  if (search.view === "week") {
    return calendarData.schedules.length > 0 ? (
      <WeekCalendar
        schedules={calendarData.schedules}
        rooms={calendarData.options.rooms}
        startAt={calendarData.window.startAt}
      />
    ) : (
      <EmptyState title="暂无排课" description="当前周和筛选条件下还没有课程安排。" />
    );
  }

  if (search.view === "month") {
    return (
      <MonthCalendar
        schedules={calendarData.schedules}
        search={search}
        startAt={calendarData.window.startAt}
      />
    );
  }

  return calendarData.schedules.length > 0 ? (
    <ListCalendar schedules={calendarData.schedules} rooms={calendarData.options.rooms} />
  ) : (
    <EmptyState title="暂无排课" description="当前时间范围和筛选条件下还没有课程安排。" />
  );
}

export default async function SchedulingCalendarPage({
  searchParams,
}: SchedulingCalendarPageProps) {
  const currentUser = await requirePermission("route:scheduling", {
    nextPath: "/dashboard/scheduling",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const search = getScheduleCalendarSearch(params);
  const calendarData = await getScheduleCalendarData(currentUser.tenantId, search);
  const previousDate = getShiftedScheduleDate(search, -1);
  const nextDate = getShiftedScheduleDate(search, 1);
  const errorMessage =
    typeof params.error === "string"
      ? errorMessages[params.error as keyof typeof errorMessages]
      : null;
  const scheduleConflictMessages = getConflictMessages(params.conflicts);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="排课日历"
        description="按日、周、月或列表查看班级、老师、校区和教室的内部排课安排；学生端只会看到自己的课程。"
        badge={`${calendarData.schedules.length} 节课`}
        actions={
          <>
            <ScheduleCreateDialog options={calendarData.options} />
            <ScheduleBatchDialog options={calendarData.options} />
            <Button asChild variant="outline" size="sm">
              <Link
                href={getHrefWithDate(search, previousDate)}
                aria-label={getNavigationLabel(search, -1)}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                {getNavigationLabel(search, -1)}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={getScheduleCalendarHref({ ...search, date: formatDate(new Date()) })}>
                今天
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link
                href={getHrefWithDate(search, nextDate)}
                aria-label={getNavigationLabel(search, 1)}
              >
                {getNavigationLabel(search, 1)}
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </>
        }
      />

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      {scheduleConflictMessages.length > 0 ? (
        <ul className="grid gap-1 rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive">
          {scheduleConflictMessages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}

      <section className="grid gap-4 rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs defaultValue={search.view}>
            <TabsList>
              <TabsTrigger asChild value="day">
                <Link href={getHrefWithView(search, "day")}>{viewLabels.day}</Link>
              </TabsTrigger>
              <TabsTrigger asChild value="week">
                <Link href={getHrefWithView(search, "week")}>{viewLabels.week}</Link>
              </TabsTrigger>
              <TabsTrigger asChild value="month">
                <Link href={getHrefWithView(search, "month")} data-testid="scheduling-view-month">
                  {viewLabels.month}
                </Link>
              </TabsTrigger>
              <TabsTrigger asChild value="list">
                <Link href={getHrefWithView(search, "list")}>{viewLabels.list}</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatDate(calendarData.window.startAt)} 至 {formatWindowEnd(calendarData.window.endAt)}
          </div>
        </div>

        <form className="grid gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto_auto]">
          <input type="hidden" name="view" value={search.view} />
          <input type="hidden" name="date" value={search.date} />

          <Select name="campusId" defaultValue={search.filters.campusId ?? "all"}>
            <SelectTrigger aria-label="校区筛选">
              <SelectValue placeholder="全部校区" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部校区</SelectItem>
              {calendarData.options.campuses.map((campus) => (
                <SelectItem key={campus.id} value={campus.id}>
                  {campus.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="teacherId" defaultValue={search.filters.teacherId ?? "all"}>
            <SelectTrigger aria-label="老师筛选">
              <SelectValue placeholder="全部老师" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部老师</SelectItem>
              {calendarData.options.teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="roomId" defaultValue={search.filters.roomId ?? "all"}>
            <SelectTrigger aria-label="教室筛选">
              <SelectValue placeholder="全部教室" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部教室</SelectItem>
              {calendarData.options.rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.campus.name}/{room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="classGroupId" defaultValue={search.filters.classGroupId ?? "all"}>
            <SelectTrigger aria-label="班级筛选">
              <SelectValue placeholder="全部班级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部班级</SelectItem>
              {calendarData.options.classGroups.map((classGroup) => (
                <SelectItem key={classGroup.id} value={classGroup.id}>
                  {classGroup.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" variant="outline">
            <Filter className="size-4" aria-hidden="true" />
            筛选
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard/scheduling">清除</Link>
          </Button>
        </form>
      </section>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-normal text-foreground">
              {viewLabels[search.view]}视图
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              当前范围共 {calendarData.schedules.length} 节课。
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="size-4" aria-hidden="true" />
              班级/老师
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" aria-hidden="true" />
              校区/教室
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-4" aria-hidden="true" />
              开始/结束
            </span>
          </div>
        </div>

        {renderCalendarView({ calendarData, search })}
      </section>
    </div>
  );
}
