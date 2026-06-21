"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteClassGroupAction } from "./actions";

export function ClassGroupDeleteForm({ classGroupId }: { classGroupId: string }) {
  return (
    <form
      action={deleteClassGroupAction}
      onSubmit={(event) => {
        if (!window.confirm("确认删除该班级？删除后不会再出现在默认班级列表中。")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="classGroupId" value={classGroupId} />
      <Button type="submit" variant="destructive">
        <Trash2 className="size-4" aria-hidden="true" />
        删除
      </Button>
    </form>
  );
}
