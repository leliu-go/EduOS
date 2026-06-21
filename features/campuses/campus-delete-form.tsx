"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteCampusAction } from "./actions";

export function CampusDeleteForm({ campusId }: { campusId: string }) {
  return (
    <form
      action={deleteCampusAction}
      onSubmit={(event) => {
        if (!window.confirm("确认删除该校区？删除后不会再出现在默认校区列表中。")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="campusId" value={campusId} />
      <Button type="submit" variant="destructive">
        <Trash2 className="size-4" aria-hidden="true" />
        删除
      </Button>
    </form>
  );
}
