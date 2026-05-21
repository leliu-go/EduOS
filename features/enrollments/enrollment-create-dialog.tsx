"use client";

import { UserPlus } from "lucide-react";

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

import { createEnrollmentAction } from "./actions";

type EnrollmentStudentOption = {
  id: string;
  name: string;
  grade: string;
};

type EnrollmentCourseProductOption = {
  id: string;
  name: string;
  totalHours: number;
  subject: {
    name: string;
  };
  grade: {
    name: string;
  };
};

type EnrollmentClassGroupOption = {
  id: string;
  name: string;
  courseProductId: string;
  courseProduct: {
    name: string;
  };
};

type EnrollmentFormOptions = {
  students: EnrollmentStudentOption[];
  courseProducts: EnrollmentCourseProductOption[];
  classGroups: EnrollmentClassGroupOption[];
};

export function EnrollmentCreateDialog({ options }: { options: EnrollmentFormOptions }) {
  const hasOptions = options.students.length > 0 && options.courseProducts.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!hasOptions}>
          <UserPlus className="size-4" aria-hidden="true" />
          新增报名
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增报名</DialogTitle>
          <DialogDescription>为学生报名课程，可选绑定到同课程下的班级。</DialogDescription>
        </DialogHeader>
        <form action={createEnrollmentAction} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="enrollment-student">学生</Label>
            <select
              id="enrollment-student"
              name="studentId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              required
            >
              {options.students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} · {student.grade}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="enrollment-course">课程</Label>
            <select
              id="enrollment-course"
              name="courseProductId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              required
            >
              {options.courseProducts.map((courseProduct) => (
                <option key={courseProduct.id} value={courseProduct.id}>
                  {courseProduct.name}（{courseProduct.subject.name} · {courseProduct.grade.name}）
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="enrollment-class-group">班级</Label>
            <select
              id="enrollment-class-group"
              name="classGroupId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">暂不分班</option>
              {options.classGroups.map((classGroup) => (
                <option key={classGroup.id} value={classGroup.id}>
                  {classGroup.name} · {classGroup.courseProduct.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              选择班级时，系统会校验班级是否属于所选课程。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="enrollment-hours">购买课时</Label>
              <Input
                id="enrollment-hours"
                name="purchasedHours"
                type="number"
                min={1}
                defaultValue={40}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="enrollment-date">报名日期</Label>
              <Input id="enrollment-date" name="enrolledAt" type="date" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="enrollment-notes">备注</Label>
            <textarea
              id="enrollment-notes"
              name="notes"
              placeholder="可选，记录报名来源、优惠说明等"
              className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <DialogFooter>
            <Button type="submit">保存报名</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
