"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";

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
  createGradeAction,
  createSubjectAction,
  createTermAction,
  deleteGradeAction,
  deleteSubjectAction,
  deleteTermAction,
  updateGradeAction,
  updateSubjectAction,
  updateTermAction,
} from "./actions";
import { configStatusLabels, configStatusValues, type ConfigStatusValue } from "./config-schema";

type SubjectFormItem = {
  id: string;
  name: string;
  code: string | null;
  status: ConfigStatusValue;
};

type GradeFormItem = {
  id: string;
  name: string;
  sortOrder: number;
  status: ConfigStatusValue;
};

type TermFormItem = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  status: ConfigStatusValue;
};

function StatusSelect({ id, defaultValue = "ACTIVE" }: { id: string; defaultValue?: ConfigStatusValue }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>状态</Label>
      <select
        id={id}
        name="status"
        defaultValue={defaultValue}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {configStatusValues.map((status) => (
          <option key={status} value={status}>
            {configStatusLabels[status]}
          </option>
        ))}
      </select>
    </div>
  );
}

function SubjectFormFields({ subject }: { subject?: SubjectFormItem }) {
  return (
    <div className="grid gap-4">
      {subject ? <input type="hidden" name="subjectId" value={subject.id} /> : null}
      <div className="grid gap-2">
        <Label htmlFor={subject ? `subject-name-${subject.id}` : "subject-name"}>科目名称</Label>
        <Input
          id={subject ? `subject-name-${subject.id}` : "subject-name"}
          name="name"
          defaultValue={subject?.name}
          placeholder="例如：数学"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={subject ? `subject-code-${subject.id}` : "subject-code"}>编码</Label>
        <Input
          id={subject ? `subject-code-${subject.id}` : "subject-code"}
          name="code"
          defaultValue={subject?.code ?? ""}
          placeholder="例如：MATH，可选"
        />
      </div>
      <StatusSelect
        id={subject ? `subject-status-${subject.id}` : "subject-status"}
        defaultValue={subject?.status}
      />
    </div>
  );
}

function GradeFormFields({ grade }: { grade?: GradeFormItem }) {
  return (
    <div className="grid gap-4">
      {grade ? <input type="hidden" name="gradeId" value={grade.id} /> : null}
      <div className="grid gap-2">
        <Label htmlFor={grade ? `grade-name-${grade.id}` : "grade-name"}>年级名称</Label>
        <Input
          id={grade ? `grade-name-${grade.id}` : "grade-name"}
          name="name"
          defaultValue={grade?.name}
          placeholder="例如：初一"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={grade ? `grade-sort-${grade.id}` : "grade-sort"}>排序</Label>
        <Input
          id={grade ? `grade-sort-${grade.id}` : "grade-sort"}
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={grade?.sortOrder ?? 10}
          required
        />
      </div>
      <StatusSelect
        id={grade ? `grade-status-${grade.id}` : "grade-status"}
        defaultValue={grade?.status}
      />
    </div>
  );
}

function TermFormFields({ term }: { term?: TermFormItem }) {
  return (
    <div className="grid gap-4">
      {term ? <input type="hidden" name="termId" value={term.id} /> : null}
      <div className="grid gap-2">
        <Label htmlFor={term ? `term-name-${term.id}` : "term-name"}>学期名称</Label>
        <Input
          id={term ? `term-name-${term.id}` : "term-name"}
          name="name"
          defaultValue={term?.name}
          placeholder="例如：2026 春季"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={term ? `term-start-${term.id}` : "term-start"}>开始日期</Label>
          <Input
            id={term ? `term-start-${term.id}` : "term-start"}
            name="startsAt"
            type="date"
            defaultValue={term?.startsAt}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={term ? `term-end-${term.id}` : "term-end"}>结束日期</Label>
          <Input
            id={term ? `term-end-${term.id}` : "term-end"}
            name="endsAt"
            type="date"
            defaultValue={term?.endsAt}
            required
          />
        </div>
      </div>
      <StatusSelect id={term ? `term-status-${term.id}` : "term-status"} defaultValue={term?.status} />
    </div>
  );
}

export function SubjectCreateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" aria-hidden="true" />
          新增科目
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增科目</DialogTitle>
          <DialogDescription>
            配置数学、语文、英语、物理等课程科目，供课程产品和班级使用。
          </DialogDescription>
        </DialogHeader>
        <form action={createSubjectAction} className="grid gap-5">
          <SubjectFormFields />
          <DialogFooter>
            <Button type="submit">保存科目</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SubjectEditDialog({ subject }: { subject: SubjectFormItem }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4" aria-hidden="true" />
          编辑
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑科目</DialogTitle>
          <DialogDescription>更新科目名称、编码和启用状态。</DialogDescription>
        </DialogHeader>
        <form action={updateSubjectAction} className="grid gap-5">
          <SubjectFormFields subject={subject} />
          <DialogFooter>
            <Button type="submit">保存修改</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SubjectDeleteForm({ subjectId }: { subjectId: string }) {
  return (
    <form
      action={deleteSubjectAction}
      onSubmit={(event) => {
        if (!window.confirm("确认删除该科目？删除后不会再出现在默认教务规则列表中。")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="subjectId" value={subjectId} />
      <Button type="submit" variant="destructive" size="sm">
        <Trash2 className="size-4" aria-hidden="true" />
        删除
      </Button>
    </form>
  );
}

export function GradeCreateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" aria-hidden="true" />
          新增年级
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增年级</DialogTitle>
          <DialogDescription>配置小学、初中、高中等年级序列。</DialogDescription>
        </DialogHeader>
        <form action={createGradeAction} className="grid gap-5">
          <GradeFormFields />
          <DialogFooter>
            <Button type="submit">保存年级</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GradeEditDialog({ grade }: { grade: GradeFormItem }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4" aria-hidden="true" />
          编辑
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑年级</DialogTitle>
          <DialogDescription>更新年级名称、排序和启用状态。</DialogDescription>
        </DialogHeader>
        <form action={updateGradeAction} className="grid gap-5">
          <GradeFormFields grade={grade} />
          <DialogFooter>
            <Button type="submit">保存修改</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GradeDeleteForm({ gradeId }: { gradeId: string }) {
  return (
    <form
      action={deleteGradeAction}
      onSubmit={(event) => {
        if (!window.confirm("确认删除该年级？删除后不会再出现在默认教务规则列表中。")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="gradeId" value={gradeId} />
      <Button type="submit" variant="destructive" size="sm">
        <Trash2 className="size-4" aria-hidden="true" />
        删除
      </Button>
    </form>
  );
}

export function TermCreateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" aria-hidden="true" />
          新增学期
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增学期</DialogTitle>
          <DialogDescription>配置课程、班级和报表使用的学期范围。</DialogDescription>
        </DialogHeader>
        <form action={createTermAction} className="grid gap-5">
          <TermFormFields />
          <DialogFooter>
            <Button type="submit">保存学期</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TermEditDialog({ term }: { term: TermFormItem }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4" aria-hidden="true" />
          编辑
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑学期</DialogTitle>
          <DialogDescription>更新学期名称、日期范围和启用状态。</DialogDescription>
        </DialogHeader>
        <form action={updateTermAction} className="grid gap-5">
          <TermFormFields term={term} />
          <DialogFooter>
            <Button type="submit">保存修改</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TermDeleteForm({ termId }: { termId: string }) {
  return (
    <form
      action={deleteTermAction}
      onSubmit={(event) => {
        if (!window.confirm("确认删除该学期？删除后不会再出现在默认教务规则列表中。")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="termId" value={termId} />
      <Button type="submit" variant="destructive" size="sm">
        <Trash2 className="size-4" aria-hidden="true" />
        删除
      </Button>
    </form>
  );
}
