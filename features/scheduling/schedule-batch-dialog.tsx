"use client";

import { CalendarRange } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createWeeklySchedulesAction } from "./actions";
import { buildWeeklyScheduleOccurrences } from "./recurring";

type ScheduleClassGroupOption = {
  id: string;
  name: string;
  courseProduct: {
    name: string;
  };
};

type ScheduleTeacherOption = {
  id: string;
  name: string;
};

type ScheduleRoomOption = {
  id: string;
  name: string;
  campus: {
    name: string;
  };
};

type ScheduleBatchOptions = {
  classGroups: ScheduleClassGroupOption[];
  teachers: ScheduleTeacherOption[];
  rooms: ScheduleRoomOption[];
};

type PreviewState = {
  lessonTitle: string;
  firstStartAt: string;
  firstEndAt: string;
  weeks: string;
};

function normalizePreviewDateTime(value: string) {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00.000Z`;
  }

  return value;
}

function parsePreviewDateTime(value: string) {
  const date = new Date(normalizePreviewDateTime(value));

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatPreviewDateTime(value: Date) {
  return `${value.toISOString().slice(0, 10)} ${value.toISOString().slice(11, 16)}`;
}

export function ScheduleBatchDialog({ options }: { options: ScheduleBatchOptions }) {
  const hasOptions =
    options.classGroups.length > 0 && options.teachers.length > 0 && options.rooms.length > 0;
  const [previewState, setPreviewState] = useState<PreviewState>({
    lessonTitle: "同步提升课",
    firstStartAt: "",
    firstEndAt: "",
    weeks: "4",
  });
  const previewOccurrences = useMemo(() => {
    const startAt = parsePreviewDateTime(previewState.firstStartAt);
    const endAt = parsePreviewDateTime(previewState.firstEndAt);
    const weeks = Number.parseInt(previewState.weeks, 10);

    if (!startAt || !endAt || endAt <= startAt || !Number.isInteger(weeks) || weeks < 1) {
      return [];
    }

    return buildWeeklyScheduleOccurrences({
      lessonTitle: previewState.lessonTitle.trim() || "课程",
      startAt,
      endAt,
      weeks: Math.min(weeks, 52),
    });
  }, [previewState]);

  function updatePreviewState(key: keyof PreviewState, value: string) {
    setPreviewState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={!hasOptions}>
          <CalendarRange className="size-4" aria-hidden="true" />
          批量排课
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>批量排课</DialogTitle>
          <DialogDescription>按每周一次生成多节课程，提交前请先核对预览。</DialogDescription>
        </DialogHeader>
        <form action={createWeeklySchedulesAction} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="batch-lesson-title">课程主题</Label>
            <Input
              id="batch-lesson-title"
              name="lessonTitle"
              value={previewState.lessonTitle}
              onChange={(event) => updatePreviewState("lessonTitle", event.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="batch-class-group">班级</Label>
            <select
              id="batch-class-group"
              name="classGroupId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              required
            >
              {options.classGroups.map((classGroup) => (
                <option key={classGroup.id} value={classGroup.id}>
                  {classGroup.name} · {classGroup.courseProduct.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="batch-teacher">老师</Label>
              <select
                id="batch-teacher"
                name="teacherId"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                required
              >
                {options.teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="batch-room">教室</Label>
              <select
                id="batch-room"
                name="roomId"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                required
              >
                {options.rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.campus.name}/{room.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr_7rem]">
            <div className="grid gap-2">
              <Label htmlFor="batch-first-start">首次开始</Label>
              <Input
                id="batch-first-start"
                name="firstStartAt"
                type="datetime-local"
                value={previewState.firstStartAt}
                onChange={(event) => updatePreviewState("firstStartAt", event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="batch-first-end">首次结束</Label>
              <Input
                id="batch-first-end"
                name="firstEndAt"
                type="datetime-local"
                value={previewState.firstEndAt}
                onChange={(event) => updatePreviewState("firstEndAt", event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="batch-weeks">周数</Label>
              <Input
                id="batch-weeks"
                name="weeks"
                type="number"
                min={1}
                max={52}
                value={previewState.weeks}
                onChange={(event) => updatePreviewState("weeks", event.target.value)}
                required
              />
            </div>
          </div>

          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-sm font-medium text-foreground">预览</p>
            {previewOccurrences.length > 0 ? (
              <ul className="mt-2 grid max-h-40 gap-2 overflow-y-auto text-sm text-muted-foreground">
                {previewOccurrences.map((occurrence, index) => (
                  <li key={`${occurrence.title}-${index}`} className="flex justify-between gap-3">
                    <span>{occurrence.title}</span>
                    <span>
                      {formatPreviewDateTime(occurrence.startAt)}-
                      {occurrence.endAt.toISOString().slice(11, 16)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">填写首次时间和周数后生成预览。</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit">生成排课</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
