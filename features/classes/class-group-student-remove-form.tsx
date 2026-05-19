"use client";

import { UserMinus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { removeClassGroupStudentAction } from "./actions";

export function ClassGroupStudentRemoveForm({
  classGroupId,
  classGroupStudentId,
}: {
  classGroupId: string;
  classGroupStudentId: string;
}) {
  return (
    <form
      action={removeClassGroupStudentAction}
      onSubmit={(event) => {
        if (!window.confirm("确认从该班级移除这名学生？")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="classGroupId" value={classGroupId} />
      <input type="hidden" name="classGroupStudentId" value={classGroupStudentId} />
      <Button type="submit" variant="outline" size="sm">
        <UserMinus className="size-4" aria-hidden="true" />
        移除
      </Button>
    </form>
  );
}
