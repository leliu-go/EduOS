"use client";

import { CalendarClock, RotateCcw, XCircle } from "lucide-react";

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

import {
  cancelScheduleAction,
  createMakeUpScheduleAction,
  rescheduleScheduleAction,
} from "./actions";

type ScheduleChangeSchedule = {
  id: string;
  roomId: string;
  startAt: string;
  endAt: string;
  status: string;
};

type ScheduleChangeRoom = {
  id: string;
  name: string;
  campus: {
    name: string;
  };
};

function formatDateTimeInput(value: string) {
  return new Date(value).toISOString().slice(0, 16);
}

function RoomSelect({
  id,
  defaultValue,
  rooms,
}: {
  id: string;
  defaultValue?: string;
  rooms: ScheduleChangeRoom[];
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>教室</Label>
      <select
        id={id}
        name="roomId"
        defaultValue={defaultValue}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        required
      >
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.campus.name}/{room.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReasonField({ id, placeholder }: { id: string; placeholder: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>原因</Label>
      <textarea
        id={id}
        name="reason"
        placeholder={placeholder}
        className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        required
      />
    </div>
  );
}

export function ScheduleChangeActions({
  schedule,
  rooms,
}: {
  schedule: ScheduleChangeSchedule;
  rooms: ScheduleChangeRoom[];
}) {
  const canChange = schedule.status !== "CANCELLED" && rooms.length > 0;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" disabled={!canChange}>
            <CalendarClock className="size-3.5" aria-hidden="true" />
            改期
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>改期</DialogTitle>
            <DialogDescription>调整当前课程的上课时间或教室，必须填写原因。</DialogDescription>
          </DialogHeader>
          <form action={rescheduleScheduleAction} className="grid gap-5">
            <input type="hidden" name="scheduleId" value={schedule.id} />
            <RoomSelect
              id={`reschedule-room-${schedule.id}`}
              defaultValue={schedule.roomId}
              rooms={rooms}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`reschedule-start-${schedule.id}`}>开始时间</Label>
                <Input
                  id={`reschedule-start-${schedule.id}`}
                  name="startAt"
                  type="datetime-local"
                  defaultValue={formatDateTimeInput(schedule.startAt)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`reschedule-end-${schedule.id}`}>结束时间</Label>
                <Input
                  id={`reschedule-end-${schedule.id}`}
                  name="endAt"
                  type="datetime-local"
                  defaultValue={formatDateTimeInput(schedule.endAt)}
                  required
                />
              </div>
            </div>
            <ReasonField id={`reschedule-reason-${schedule.id}`} placeholder="例如：老师请假顺延" />
            <DialogFooter>
              <Button type="submit">保存改期</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" disabled={!canChange}>
            <XCircle className="size-3.5" aria-hidden="true" />
            取消
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>取消课程</DialogTitle>
            <DialogDescription>取消后会保留原记录，并写入变更日志。</DialogDescription>
          </DialogHeader>
          <form action={cancelScheduleAction} className="grid gap-5">
            <input type="hidden" name="scheduleId" value={schedule.id} />
            <ReasonField id={`cancel-reason-${schedule.id}`} placeholder="例如：节假日停课" />
            <DialogFooter>
              <Button type="submit" variant="destructive">
                确认取消
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" disabled={rooms.length === 0}>
            <RotateCcw className="size-3.5" aria-hidden="true" />
            补课
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>安排补课</DialogTitle>
            <DialogDescription>基于当前课程新增一节补课记录，必须填写原因。</DialogDescription>
          </DialogHeader>
          <form action={createMakeUpScheduleAction} className="grid gap-5">
            <input type="hidden" name="scheduleId" value={schedule.id} />
            <RoomSelect
              id={`make-up-room-${schedule.id}`}
              defaultValue={schedule.roomId}
              rooms={rooms}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`make-up-start-${schedule.id}`}>开始时间</Label>
                <Input
                  id={`make-up-start-${schedule.id}`}
                  name="startAt"
                  type="datetime-local"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`make-up-end-${schedule.id}`}>结束时间</Label>
                <Input
                  id={`make-up-end-${schedule.id}`}
                  name="endAt"
                  type="datetime-local"
                  required
                />
              </div>
            </div>
            <ReasonField id={`make-up-reason-${schedule.id}`} placeholder="例如：补回取消课次" />
            <DialogFooter>
              <Button type="submit">保存补课</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
