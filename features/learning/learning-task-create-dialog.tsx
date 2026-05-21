"use client";

import { CalendarPlus, Plus } from "lucide-react";
import type { ReactNode } from "react";

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

import { createLearningTaskAction } from "./actions";
import {
  learningTaskTypeHints,
  learningTaskTypeLabels,
  learningTaskTypeValues,
} from "./learning-schema";

type LearningTaskCreateDialogOptions = {
  classGroups: Array<{
    id: string;
    name: string;
    courseProduct: {
      name: string;
    };
    studentCount: number;
  }>;
  students: Array<{
    id: string;
    name: string;
    grade: string;
  }>;
};

function SelectField({
  id,
  name,
  label,
  children,
}: {
  id: string;
  name: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
      >
        {children}
      </select>
    </div>
  );
}

export function LearningTaskCreateDialog({
  options,
}: {
  options: LearningTaskCreateDialogOptions;
}) {
  const hasTargets = options.classGroups.length > 0 || options.students.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!hasTargets}>
          <Plus className="size-4" aria-hidden="true" />
          布置学习任务
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>布置每日学习任务</DialogTitle>
          <DialogDescription>
            适合单词打卡、每日阅读、听力练习和错题后的针对加练。第一版支持布置给一个班级或单个学生。
          </DialogDescription>
        </DialogHeader>
        <form action={createLearningTaskAction} className="grid gap-5">
          <input type="hidden" name="returnTo" value="/dashboard/learning" />
          <div className="grid gap-2">
            <Label htmlFor="learning-task-title">任务标题</Label>
            <Input id="learning-task-title" name="title" placeholder="例如：七上 Unit 3 词汇打卡" required />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <SelectField id="learning-task-type" name="taskType" label="任务类型">
              {learningTaskTypeValues.map((type) => (
                <option key={type} value={type}>
                  {learningTaskTypeLabels[type]} - {learningTaskTypeHints[type]}
                </option>
              ))}
            </SelectField>
            <div className="grid gap-2">
              <Label htmlFor="learning-task-date">目标日期</Label>
              <Input id="learning-task-date" name="targetDate" type="date" required />
            </div>
          </div>
          <div className="rounded-md border bg-muted/35 p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarPlus className="size-4" aria-hidden="true" />
              布置对象，班级或学生二选一
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <SelectField id="learning-task-class" name="classGroupId" label="班级">
                <option value="">不按班级布置</option>
                {options.classGroups.map((classGroup) => (
                  <option key={classGroup.id} value={classGroup.id}>
                    {classGroup.name} - {classGroup.courseProduct.name} - {classGroup.studentCount}人
                  </option>
                ))}
              </SelectField>
              <SelectField id="learning-task-student" name="studentId" label="学生">
                <option value="">不单独布置</option>
                {options.students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.grade}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="learning-task-description">任务说明</Label>
            <textarea
              id="learning-task-description"
              name="description"
              placeholder="写清单词范围、阅读篇目、听力音频或练习要求"
              className="min-h-24 rounded-md border border-input bg-card px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            />
          </div>
          <DialogFooter>
            <Button type="submit">保存任务</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
