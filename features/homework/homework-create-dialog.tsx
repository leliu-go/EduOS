import { NotebookPen, Plus } from "lucide-react";
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

import { createHomeworkAction } from "./actions";

type HomeworkCreateDialogOptions = {
  classGroups: Array<{
    id: string;
    name: string;
    courseProduct: {
      name: string;
    };
  }>;
  lessons: Array<{
    id: string;
    title: string;
    classGroup: {
      name: string;
    };
  }>;
  students: Array<{
    id: string;
    name: string;
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
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {children}
      </select>
    </div>
  );
}

export function HomeworkCreateDialog({
  options,
  returnTo,
}: {
  options: HomeworkCreateDialogOptions;
  returnTo: "/dashboard/homework" | "/teacher/homework";
}) {
  const hasTargets =
    options.classGroups.length > 0 || options.lessons.length > 0 || options.students.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!hasTargets}>
          <Plus className="size-4" aria-hidden="true" />
          布置作业
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>布置作业</DialogTitle>
          <DialogDescription>选择一个班级、课次或学生，填写截止时间和作业要求。</DialogDescription>
        </DialogHeader>
        <form action={createHomeworkAction} className="grid gap-5">
          <input type="hidden" name="returnTo" value={returnTo} />
          <div className="grid gap-2">
            <Label htmlFor="homework-title">作业标题</Label>
            <Input id="homework-title" name="title" placeholder="例如：函数图像练习" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="homework-due-at">截止时间</Label>
            <Input id="homework-due-at" name="dueAt" type="datetime-local" required />
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <NotebookPen className="size-4" aria-hidden="true" />
              布置对象（三选一）
            </div>
            <div className="grid gap-3">
              <SelectField id="homework-class" name="classGroupId" label="班级">
                <option value="">不按班级布置</option>
                {options.classGroups.map((classGroup) => (
                  <option key={classGroup.id} value={classGroup.id}>
                    {classGroup.name} · {classGroup.courseProduct.name}
                  </option>
                ))}
              </SelectField>
              <SelectField id="homework-lesson" name="lessonId" label="课次">
                <option value="">不按课次布置</option>
                {options.lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title} · {lesson.classGroup.name}
                  </option>
                ))}
              </SelectField>
              <SelectField id="homework-student" name="studentId" label="学生">
                <option value="">不单独布置</option>
                {options.students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="homework-instructions">作业要求</Label>
            <textarea
              id="homework-instructions"
              name="instructions"
              required
              placeholder="写清完成范围、提交要求和注意事项"
              className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <DialogFooter>
            <Button type="submit">保存作业</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
