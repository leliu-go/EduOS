"use client";

import { Pencil, Plus, UserPlus } from "lucide-react";
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

import {
  addClassGroupStudentAction,
  createClassGroupAction,
  updateClassGroupAction,
} from "./actions";
import {
  classGroupStatusLabels,
  classGroupStatusValues,
  type ClassGroupStatusValue,
} from "./class-group-schema";

type ClassGroupCourseProductOption = {
  id: string;
  name: string;
  subject: {
    name: string;
  };
  grade: {
    name: string;
  };
};

type ClassGroupTeacherOption = {
  id: string;
  name: string;
};

type ClassGroupCampusOption = {
  id: string;
  name: string;
};

type ClassGroupStudentOption = {
  id: string;
  name: string;
  grade: string;
};

type ClassGroupFormOptions = {
  courseProducts: ClassGroupCourseProductOption[];
  teachers: ClassGroupTeacherOption[];
  campuses: ClassGroupCampusOption[];
};

type ClassGroupFormClassGroup = {
  id: string;
  name: string;
  courseProductId: string;
  primaryTeacherId: string;
  campusId: string;
  capacity: number;
  status: ClassGroupStatusValue;
  startsAt: Date;
  endsAt: Date;
};

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function SelectField({
  id,
  name,
  label,
  defaultValue,
  children,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        required
      >
        {children}
      </select>
    </div>
  );
}

function ClassGroupFormFields({
  options,
  classGroup,
}: {
  options: ClassGroupFormOptions;
  classGroup?: ClassGroupFormClassGroup;
}) {
  const visibleStatuses = classGroupStatusValues.filter((status) => status !== "ARCHIVED");

  return (
    <div className="grid gap-4">
      {classGroup ? <input type="hidden" name="classGroupId" value={classGroup.id} /> : null}
      <div className="grid gap-2">
        <Label htmlFor="class-group-name">班级名称</Label>
        <Input
          id="class-group-name"
          name="name"
          defaultValue={classGroup?.name}
          placeholder="例如：初二数学 A 班"
          required
        />
      </div>
      <SelectField
        id="class-group-course-product"
        name="courseProductId"
        label="课程产品"
        defaultValue={classGroup?.courseProductId}
      >
        {options.courseProducts.map((courseProduct) => (
          <option key={courseProduct.id} value={courseProduct.id}>
            {courseProduct.name}（{courseProduct.subject.name} · {courseProduct.grade.name}）
          </option>
        ))}
      </SelectField>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          id="class-group-teacher"
          name="primaryTeacherId"
          label="主讲老师"
          defaultValue={classGroup?.primaryTeacherId}
        >
          {options.teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          id="class-group-campus"
          name="campusId"
          label="校区"
          defaultValue={classGroup?.campusId}
        >
          {options.campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.name}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="class-group-capacity">容量</Label>
          <Input
            id="class-group-capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={classGroup?.capacity ?? 16}
            required
          />
        </div>
        <SelectField
          id="class-group-status"
          name="status"
          label="状态"
          defaultValue={
            classGroup?.status === "ARCHIVED" ? "PAUSED" : (classGroup?.status ?? "PLANNING")
          }
        >
          {visibleStatuses.map((status) => (
            <option key={status} value={status}>
              {classGroupStatusLabels[status]}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="class-group-start">开始日期</Label>
          <Input
            id="class-group-start"
            name="startsAt"
            type="date"
            defaultValue={classGroup ? formatDateInput(classGroup.startsAt) : undefined}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="class-group-end">结束日期</Label>
          <Input
            id="class-group-end"
            name="endsAt"
            type="date"
            defaultValue={classGroup ? formatDateInput(classGroup.endsAt) : undefined}
            required
          />
        </div>
      </div>
    </div>
  );
}

export function ClassGroupCreateDialog({ options }: { options: ClassGroupFormOptions }) {
  const hasOptions =
    options.courseProducts.length > 0 && options.teachers.length > 0 && options.campuses.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!hasOptions}>
          <Plus className="size-4" aria-hidden="true" />
          新增班级
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增班级</DialogTitle>
          <DialogDescription>创建课程产品对应的实际教学班级。</DialogDescription>
        </DialogHeader>
        <form action={createClassGroupAction} className="grid gap-5">
          <ClassGroupFormFields options={options} />
          <DialogFooter>
            <Button type="submit">保存班级</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ClassGroupEditDialog({
  options,
  classGroup,
}: {
  options: ClassGroupFormOptions;
  classGroup: ClassGroupFormClassGroup;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="size-4" aria-hidden="true" />
          编辑班级
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑班级</DialogTitle>
          <DialogDescription>更新课程、老师、校区、容量和起止日期。</DialogDescription>
        </DialogHeader>
        <form action={updateClassGroupAction} className="grid gap-5">
          <ClassGroupFormFields options={options} classGroup={classGroup} />
          <DialogFooter>
            <Button type="submit">保存修改</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ClassGroupStudentAddDialog({
  classGroupId,
  students,
}: {
  classGroupId: string;
  students: ClassGroupStudentOption[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={students.length === 0}>
          <UserPlus className="size-4" aria-hidden="true" />
          添加学生
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加学生</DialogTitle>
          <DialogDescription>容量已满时需要勾选确认，才允许继续添加学生。</DialogDescription>
        </DialogHeader>
        <form action={addClassGroupStudentAction} className="grid gap-5">
          <input type="hidden" name="classGroupId" value={classGroupId} />
          <SelectField id="class-group-student" name="studentId" label="学生">
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} · {student.grade}
              </option>
            ))}
          </SelectField>
          <label className="flex items-start gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground">
            <input className="mt-1" type="checkbox" name="confirmCapacityOverride" />
            <span>我已确认班级可能超出容量，仍要添加该学生。</span>
          </label>
          <DialogFooter>
            <Button type="submit">添加学生</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
