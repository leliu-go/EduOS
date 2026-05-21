"use client";

import { Plus } from "lucide-react";

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

import { createGradeAction, createSubjectAction, createTermAction } from "./actions";
import { configStatusLabels, configStatusValues } from "./config-schema";

function StatusSelect({ id }: { id: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>状态</Label>
      <select
        id={id}
        name="status"
        defaultValue="ACTIVE"
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
          <DialogDescription>配置数学、语文、英语、物理等可售课程科目。</DialogDescription>
        </DialogHeader>
        <form action={createSubjectAction} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="subject-name">科目名称</Label>
            <Input id="subject-name" name="name" placeholder="例如：数学" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject-code">编码</Label>
            <Input id="subject-code" name="code" placeholder="例如：MATH，可选" />
          </div>
          <StatusSelect id="subject-status" />
          <DialogFooter>
            <Button type="submit">保存科目</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
          <div className="grid gap-2">
            <Label htmlFor="grade-name">年级名称</Label>
            <Input id="grade-name" name="name" placeholder="例如：初一" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="grade-sort">排序</Label>
            <Input
              id="grade-sort"
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={10}
              required
            />
          </div>
          <StatusSelect id="grade-status" />
          <DialogFooter>
            <Button type="submit">保存年级</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
          <div className="grid gap-2">
            <Label htmlFor="term-name">学期名称</Label>
            <Input id="term-name" name="name" placeholder="例如：2026 春季" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="term-start">开始日期</Label>
              <Input id="term-start" name="startsAt" type="date" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="term-end">结束日期</Label>
              <Input id="term-end" name="endsAt" type="date" required />
            </div>
          </div>
          <StatusSelect id="term-status" />
          <DialogFooter>
            <Button type="submit">保存学期</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
