"use client";

import { Archive } from "lucide-react";

import { Button } from "@/components/ui/button";

import { archiveCourseProductAction } from "./actions";

export function CourseProductArchiveForm({ courseProductId }: { courseProductId: string }) {
  return (
    <form
      action={archiveCourseProductAction}
      onSubmit={(event) => {
        if (!window.confirm("确认归档该课程产品？归档后将不再出现在课程列表。")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="courseProductId" value={courseProductId} />
      <Button type="submit" variant="destructive">
        <Archive className="size-4" aria-hidden="true" />
        归档课程
      </Button>
    </form>
  );
}
