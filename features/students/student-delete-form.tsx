"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteStudentAction } from "./actions";

export function StudentDeleteForm({ studentId, studentName }: { studentId: string; studentName: string }) {
  return (
    <form
      action={deleteStudentAction}
      onSubmit={(event) => {
        if (!window.confirm(`确认删除学生「${studentName}」？删除后默认列表将不再显示该学生。`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="studentId" value={studentId} />
      <Button type="submit" variant="destructive" size="sm">
        <Trash2 className="size-4" aria-hidden="true" />
        删除
      </Button>
    </form>
  );
}
