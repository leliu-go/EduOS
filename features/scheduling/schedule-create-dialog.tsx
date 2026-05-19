import { CalendarPlus } from "lucide-react";

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

import { createScheduleAction } from "./actions";

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

type ScheduleCreateOptions = {
  classGroups: ScheduleClassGroupOption[];
  teachers: ScheduleTeacherOption[];
  rooms: ScheduleRoomOption[];
};

export function ScheduleCreateDialog({ options }: { options: ScheduleCreateOptions }) {
  const hasOptions =
    options.classGroups.length > 0 && options.teachers.length > 0 && options.rooms.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!hasOptions}>
          <CalendarPlus className="size-4" aria-hidden="true" />
          新增排课
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增排课</DialogTitle>
          <DialogDescription>创建一节单次课程，保存后会显示在排课日历中。</DialogDescription>
        </DialogHeader>
        <form action={createScheduleAction} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="schedule-lesson-title">课程主题</Label>
            <Input
              id="schedule-lesson-title"
              name="lessonTitle"
              placeholder="例如：函数专题讲解"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="schedule-class-group">班级</Label>
            <select
              id="schedule-class-group"
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
              <Label htmlFor="schedule-teacher">老师</Label>
              <select
                id="schedule-teacher"
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
              <Label htmlFor="schedule-room">教室</Label>
              <select
                id="schedule-room"
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="schedule-start-at">开始时间</Label>
              <Input id="schedule-start-at" name="startAt" type="datetime-local" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="schedule-end-at">结束时间</Label>
              <Input id="schedule-end-at" name="endAt" type="datetime-local" required />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">保存排课</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
