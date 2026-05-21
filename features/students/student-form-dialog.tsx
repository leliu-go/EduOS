"use client";

import { Pencil, Plus } from "lucide-react";

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

import { createStudentAction, updateStudentAction } from "./actions";
import {
  formatStudentBirthday,
  studentGenderLabels,
  studentGenderValues,
  studentStatusLabels,
  studentStatusValues,
  type StudentGenderValue,
  type StudentStatusValue,
} from "./student-schema";

type StudentFormStudent = {
  id: string;
  name: string;
  gender: StudentGenderValue | null;
  birthday: Date | null;
  grade: string;
  school: string | null;
  status: StudentStatusValue;
  notes: string | null;
};

function SelectField({
  id,
  name,
  label,
  defaultValue,
  options,
  allowEmpty = false,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
  options: Array<{ value: string; label: string }>;
  allowEmpty?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {allowEmpty ? <option value="">未填写</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StudentFormFields({ student }: { student?: StudentFormStudent }) {
  const genderOptions = studentGenderValues.map((value) => ({
    value,
    label: studentGenderLabels[value],
  }));
  const statusOptions = studentStatusValues.map((value) => ({
    value,
    label: studentStatusLabels[value],
  }));

  return (
    <div className="grid gap-4">
      {student ? <input type="hidden" name="studentId" value={student.id} /> : null}
      <div className="grid gap-2">
        <Label htmlFor="student-name">姓名</Label>
        <Input
          id="student-name"
          name="name"
          placeholder="请输入学生姓名"
          defaultValue={student?.name}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id="student-gender"
          name="gender"
          label="性别"
          defaultValue={student?.gender}
          options={genderOptions}
          allowEmpty
        />
        <div className="grid gap-2">
          <Label htmlFor="student-birthday">生日</Label>
          <Input
            id="student-birthday"
            name="birthday"
            type="date"
            defaultValue={formatStudentBirthday(student?.birthday)}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="student-grade">年级</Label>
          <Input
            id="student-grade"
            name="grade"
            placeholder="例如：初一"
            defaultValue={student?.grade}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="student-school">学校</Label>
          <Input
            id="student-school"
            name="school"
            placeholder="可选"
            defaultValue={student?.school ?? ""}
          />
        </div>
      </div>
      <SelectField
        id="student-status"
        name="status"
        label="状态"
        defaultValue={student?.status ?? "ACTIVE"}
        options={statusOptions}
      />
      <div className="grid gap-2">
        <Label htmlFor="student-notes">备注</Label>
        <textarea
          id="student-notes"
          name="notes"
          rows={4}
          defaultValue={student?.notes ?? ""}
          className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          placeholder="记录学习特点、沟通偏好等内部备注"
        />
      </div>
    </div>
  );
}

export function StudentCreateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" aria-hidden="true" />
          新增学生
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增学生</DialogTitle>
          <DialogDescription>创建机构内学生档案，后续可继续绑定监护人和课程。</DialogDescription>
        </DialogHeader>
        <form action={createStudentAction} className="grid gap-5">
          <StudentFormFields />
          <DialogFooter>
            <Button type="submit">保存学生</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function StudentEditDialog({ student }: { student: StudentFormStudent }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="size-4" aria-hidden="true" />
          编辑档案
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑学生档案</DialogTitle>
          <DialogDescription>更新学生基础信息，变更会写入审计日志。</DialogDescription>
        </DialogHeader>
        <form action={updateStudentAction} className="grid gap-5">
          <StudentFormFields student={student} />
          <DialogFooter>
            <Button type="submit">保存修改</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
