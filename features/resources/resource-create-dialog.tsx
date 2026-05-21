"use client";

import { CalendarClock, Library, Plus } from "lucide-react";
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

import { createResourceMetadataAction } from "./actions";
import { resourceTypeLabels, resourceTypeValues } from "./resource-schema";

type ResourceCreateDialogOptions = {
  courseProducts: Array<{
    id: string;
    name: string;
    subject: {
      name: string;
    };
    grade: {
      name: string;
    };
  }>;
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
};

function SelectField({
  id,
  name,
  label,
  children,
  required = false,
  defaultValue,
}: {
  id: string;
  name: string;
  label: string;
  children: ReactNode;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        required={required}
      >
        {children}
      </select>
    </div>
  );
}

export function ResourceCreateDialog({
  options,
  returnTo,
  defaultLessonId,
}: {
  options: ResourceCreateDialogOptions;
  returnTo: "/dashboard/resources" | "/teacher/resources" | `/teacher/lessons/${string}`;
  defaultLessonId?: string;
}) {
  const hasBindingOptions =
    options.courseProducts.length > 0 ||
    options.classGroups.length > 0 ||
    options.lessons.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!hasBindingOptions}>
          <Plus className="size-4" aria-hidden="true" />
          上传元数据
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增课程资源</DialogTitle>
          <DialogDescription>
            保存资源名称、类型、文件链接和绑定对象，实际文件存储可后续接入。
          </DialogDescription>
        </DialogHeader>
        <form action={createResourceMetadataAction} className="grid gap-5">
          <input type="hidden" name="returnTo" value={returnTo} />
          <div className="grid gap-2">
            <Label htmlFor="resource-title">资源名称</Label>
            <Input id="resource-title" name="title" placeholder="例如：一次函数讲义" required />
          </div>
          <SelectField id="resource-type" name="resourceType" label="资源类型" required>
            {resourceTypeValues.map((resourceType) => (
              <option key={resourceType} value={resourceType}>
                {resourceTypeLabels[resourceType]}
              </option>
            ))}
          </SelectField>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="resource-file-name">文件名</Label>
              <Input id="resource-file-name" name="fileName" placeholder="例如：lesson-01.pdf" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="resource-file-url">文件链接</Label>
              <Input id="resource-file-url" name="fileUrl" placeholder="https://..." />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="resource-release-at" className="flex items-center gap-2">
              <CalendarClock className="size-4" aria-hidden="true" />
              开放时间
            </Label>
            <Input id="resource-release-at" name="releaseAt" type="datetime-local" />
            <p className="text-xs text-muted-foreground">
              留空表示立即开放；设置未来时间后，学生端到时才可见。
            </p>
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Library className="size-4" aria-hidden="true" />
              绑定范围
            </div>
            <div className="grid gap-3">
              <SelectField id="resource-course" name="courseProductId" label="课程">
                <option value="">不绑定课程</option>
                {options.courseProducts.map((courseProduct) => (
                  <option key={courseProduct.id} value={courseProduct.id}>
                    {courseProduct.name} · {courseProduct.subject.name}/{courseProduct.grade.name}
                  </option>
                ))}
              </SelectField>
              <SelectField id="resource-class" name="classGroupId" label="班级">
                <option value="">不绑定班级</option>
                {options.classGroups.map((classGroup) => (
                  <option key={classGroup.id} value={classGroup.id}>
                    {classGroup.name} · {classGroup.courseProduct.name}
                  </option>
                ))}
              </SelectField>
              <SelectField
                id="resource-lesson"
                name="lessonId"
                label="课节"
                defaultValue={defaultLessonId}
              >
                <option value="">不绑定课节</option>
                {options.lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title} · {lesson.classGroup.name}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="resource-description">说明</Label>
            <textarea
              id="resource-description"
              name="description"
              placeholder="可选，说明资源用途或适用课次"
              className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <DialogFooter>
            <Button type="submit">保存资源</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
