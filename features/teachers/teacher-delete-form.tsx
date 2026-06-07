"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteTeacherAction } from "./actions";

export function TeacherDeleteForm({ teacherId, teacherName }: { teacherId: string; teacherName: string }) {
  return (
    <form
      action={deleteTeacherAction}
      onSubmit={(event) => {
        if (!window.confirm(`确认删除老师「${teacherName}」？删除后默认列表将不再显示该老师。`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="teacherId" value={teacherId} />
      <Button type="submit" variant="destructive" size="sm">
        <Trash2 className="size-4" aria-hidden="true" />
        删除
      </Button>
    </form>
  );
}
