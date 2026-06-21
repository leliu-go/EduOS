"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteRoomAction } from "./actions";

export function RoomDeleteForm({ campusId, roomId }: { campusId: string; roomId: string }) {
  return (
    <form
      action={deleteRoomAction}
      onSubmit={(event) => {
        if (!window.confirm("确认删除该教室？删除后不会再出现在默认教室列表中。")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="campusId" value={campusId} />
      <input type="hidden" name="roomId" value={roomId} />
      <Button type="submit" variant="destructive" size="sm">
        <Trash2 className="size-4" aria-hidden="true" />
        删除
      </Button>
    </form>
  );
}
