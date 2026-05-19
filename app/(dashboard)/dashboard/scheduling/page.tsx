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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getScheduleCalendarHref,
  getScheduleCalendarSearch,
  getShiftedScheduleDate,
  type ScheduleCalendarSearch,
} from "@/features/scheduling/calendar";
import { getScheduleCalendarData, type ScheduleCalendarItem } from "@/features/scheduling/queries";
import { scheduleStatusLabels } from "@/features/scheduling/schedule-schema";
import { requirePermission } from "@/lib/rbac/require-permission";
import { cn } from "@/lib/utils";

type SchedulingCalendarPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const viewLabels = {
  day: "日",
  week: "周",
  list: "列表",
} as const;

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatTime(value: Date) {
  return value.toISOString().slice(11, 16);
}

function formatScheduleTime(schedule: ScheduleCalendarItem) {
  return `${formatDate(schedule.startAt)} ${formatTime(schedule.startAt)}-${formatTime(schedule.endAt)}`;
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

function getWeekDays(startAt: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startAt);
    date.setUTCDate(date.getUTCDate() + index);

    return formatDate(date);
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
  compact = false,
}: {
  schedule: ScheduleCalendarItem;
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
    </div>
  );
}

function DayCalendar({ schedules }: { schedules: ScheduleCalendarItem[] }) {
  return (
    <div className="grid gap-3">
      {schedules.map((schedule) => (
        <ScheduleEvent key={schedule.id} schedule={schedule} />
      ))}
    </div>
  );
}

function WeekCalendar({
  schedules,
  startAt,
}: {
  schedules: ScheduleCalendarItem[];
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
                  <ScheduleEvent key={schedule.id} schedule={schedule} compact />
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

function ListCalendar({ schedules }: { schedules: ScheduleCalendarItem[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr_auto] gap-3 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>时间</span>
          <span>班级</span>
          <span>老师</span>
          <span>教室</span>
          <span>状态</span>
        </div>
        <div className="divide-y">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="grid grid-cols-[1.3fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 text-sm"
            >
              <span className="text-foreground">{formatScheduleTime(schedule)}</span>
              <span className="text-muted-foreground">{schedule.classGroup.name}</span>
              <span className="text-muted-foreground">{schedule.teacher.name}</span>
              <span className="text-muted-foreground">
                {schedule.campus.name}/{schedule.room.name}
              </span>
              <Badge variant="secondary">{scheduleStatusLabels[schedule.status]}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
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

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">排课日历</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            按日、周或列表查看班级、老师、校区和教室的内部排课安排。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={getHrefWithDate(search, previousDate)} aria-label="上一段时间">
              <ChevronLeft className="size-4" aria-hidden="true" />
              上一段
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={getScheduleCalendarHref({ ...search, date: formatDate(new Date()) })}>
              今天
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={getHrefWithDate(search, nextDate)} aria-label="下一段时间">
              下一段
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

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
              <TabsTrigger asChild value="list">
                <Link href={getHrefWithView(search, "list")}>{viewLabels.list}</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatDate(calendarData.window.startAt)} 至 {formatDate(calendarData.window.endAt)}
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

        {calendarData.schedules.length > 0 ? (
          <Tabs defaultValue={search.view}>
            <TabsContent value="day">
              <DayCalendar schedules={calendarData.schedules} />
            </TabsContent>
            <TabsContent value="week">
              <WeekCalendar
                schedules={calendarData.schedules}
                startAt={calendarData.window.startAt}
              />
            </TabsContent>
            <TabsContent value="list">
              <ListCalendar schedules={calendarData.schedules} />
            </TabsContent>
          </Tabs>
        ) : (
          <EmptyState title="暂无排课" description="当前时间范围和筛选条件下还没有课程安排。" />
        )}
      </section>
    </div>
  );
}
